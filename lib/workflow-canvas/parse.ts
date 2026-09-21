/**
 * The only module in the codebase that understands raw n8n workflow JSON.
 *
 * `parseN8nWorkflowJson` takes the text an admin pasted into the CMS,
 * `parseN8nWorkflow` takes an already-decoded payload; both return a
 * `WorkflowCanvasParseResult` and never throw. Output is deterministic — the
 * same input always yields a byte-identical `WorkflowCanvas`, because the
 * result is persisted as jsonb and diffed on save.
 */

import {
  NODE_SIZE,
  STICKY_DEFAULT_HEIGHT,
  STICKY_DEFAULT_WIDTH,
  type CanvasBounds,
  type CanvasEdge,
  type CanvasEdgeKind,
  type CanvasNode,
  type CanvasNodeShape,
  type CanvasSticky,
  type WorkflowCanvas,
  type WorkflowCanvasParseResult,
} from "@/lib/workflow-canvas/types";

/** n8n's sticky note type key — stickies never take part in the graph. */
const STICKY_TYPE_KEY = "stickynote";

/** Attachment nodes (models, memory, tools) are drawn as small circles. */
const ATTACHMENT_SIZE = 48;

/** A pasted export bigger than this is almost certainly not a portfolio demo. */
const MAX_NODES = 500;

/**
 * Type keys that start a workflow but do not end in `trigger`.
 * Everything else is matched by the `*trigger` suffix rule.
 */
const TRIGGER_TYPE_KEYS = new Set([
  "webhook",
  "cron",
  "interval",
  "start",
  "formtrigger",
  "executeworkflowtrigger",
  "chattrigger",
]);

type RawRecord = Record<string, unknown>;

type RawNode = {
  id: string;
  name: string;
  type: string;
  typeKey: string;
  x: number;
  y: number;
  disabled: boolean;
  parameters: RawRecord;
};

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/** n8n writes numbers, but hand-edited exports sometimes carry numeric strings. */
function asFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

/** `n8n-nodes-base.googleSheets` -> `googlesheets`. */
function toTypeKey(type: string): string {
  const segments = type.split(".");
  const last = segments[segments.length - 1] ?? "";
  return last.toLowerCase();
}

/**
 * `nodes` normally sits at the root, but API responses and some export tools
 * nest the workflow one level down.
 */
function findPayload(input: RawRecord): RawRecord | null {
  if (Array.isArray(input.nodes)) return input;
  for (const key of ["workflow", "data"]) {
    const nested = input[key];
    if (isRecord(nested) && Array.isArray(nested.nodes)) return nested;
  }
  return null;
}

function readRawNodes(list: readonly unknown[]): RawNode[] {
  const nodes: RawNode[] = [];
  list.forEach((entry, index) => {
    if (!isRecord(entry)) return;
    const name = asString(entry.name);
    const type = asString(entry.type);
    const id = asString(entry.id) || name || `node-${index}`;
    const position = Array.isArray(entry.position) ? entry.position : [];
    nodes.push({
      id,
      name,
      type,
      typeKey: toTypeKey(type),
      x: asFiniteNumber(position[0], 0),
      y: asFiniteNumber(position[1], 0),
      disabled: entry.disabled === true,
      parameters: isRecord(entry.parameters) ? entry.parameters : {},
    });
  });
  return nodes;
}

/**
 * A short, honest secondary line taken straight from `parameters`.
 * Only the handful of fields that mean the same thing across node types —
 * never a guess, never a per-node-type lookup table.
 */
function deriveSubtitle(parameters: RawRecord): string {
  const resource = asString(parameters.resource).trim();
  const operation = asString(parameters.operation).trim();
  if (operation && resource) return `${operation}: ${resource}`;
  if (operation) return operation;
  if (resource) return resource;

  // HTTP Request and friends describe themselves by verb.
  const method = asString(parameters.method).trim();
  if (method) return method.toUpperCase();

  return "";
}

function deriveShape(node: RawNode, aiOnlySources: ReadonlySet<string>): CanvasNodeShape {
  if (node.typeKey.endsWith("trigger") || TRIGGER_TYPE_KEYS.has(node.typeKey)) {
    return "trigger";
  }
  // Language models, memory, tools and output parsers only ever feed an agent
  // through an `ai_*` port — that is what makes them sub-nodes.
  if (aiOnlySources.has(node.name)) return "attachment";
  return "default";
}

function edgeKind(port: string): CanvasEdgeKind {
  if (port === "error") return "error";
  if (port.startsWith("ai_")) return "ai";
  return "main";
}

/**
 * Branch labels. Only multi-output `main` ports get one: IF nodes read
 * true/false, everything else (Switch, custom routers) falls back to the index.
 */
function edgeLabel(node: RawNode, port: string, outputCount: number, index: number): string {
  if (port !== "main" || outputCount < 2) return "";
  if (node.typeKey === "if") return index === 0 ? "true" : "false";
  return String(index);
}

function readStickies(rawNodes: readonly RawNode[]): CanvasSticky[] {
  const stickies = rawNodes
    .filter((node) => node.typeKey === STICKY_TYPE_KEY)
    .map((node) => ({
      id: node.id,
      content: asString(node.parameters.content),
      color: asFiniteNumber(node.parameters.color, 1),
      x: node.x,
      y: node.y,
      width: asFiniteNumber(node.parameters.width, STICKY_DEFAULT_WIDTH),
      height: asFiniteNumber(node.parameters.height, STICKY_DEFAULT_HEIGHT),
    }));

  // Largest first so wide backdrop stickies paint behind the small ones.
  return stickies.sort((a, b) => {
    const areaDiff = b.width * b.height - a.width * a.height;
    if (areaDiff !== 0) return areaDiff;
    if (a.y !== b.y) return a.y - b.y;
    if (a.x !== b.x) return a.x - b.x;
    return a.id.localeCompare(b.id);
  });
}

/**
 * Walks `connections` once to find every node that is exclusively an `ai_*`
 * source — those render as attachments, which changes their box size, so this
 * has to happen before nodes are built.
 */
function findAiOnlySources(connections: RawRecord): Set<string> {
  const aiOnly = new Set<string>();
  for (const [sourceName, ports] of Object.entries(connections)) {
    if (!isRecord(ports)) continue;
    const portKeys = Object.keys(ports).filter((key) => {
      const outputs = ports[key];
      return Array.isArray(outputs) && outputs.some((slot) => Array.isArray(slot) && slot.length > 0);
    });
    if (portKeys.length > 0 && portKeys.every((key) => key.startsWith("ai_"))) {
      aiOnly.add(sourceName);
    }
  }
  return aiOnly;
}

function buildEdges(
  connections: RawRecord,
  rawByName: ReadonlyMap<string, RawNode>,
  orderById: ReadonlyMap<string, number>,
): CanvasEdge[] {
  const edges: CanvasEdge[] = [];
  const seen = new Set<string>();

  for (const [sourceName, ports] of Object.entries(connections)) {
    const sourceNode = rawByName.get(sourceName);
    if (!sourceNode || !isRecord(ports)) continue;
    // A sticky can never be an endpoint, and a dangling name is simply dropped.
    if (!orderById.has(sourceNode.id)) continue;

    for (const [port, outputs] of Object.entries(ports)) {
      if (!Array.isArray(outputs)) continue;
      outputs.forEach((slot, sourceIndex) => {
        if (!Array.isArray(slot)) return;
        for (const target of slot) {
          if (!isRecord(target)) continue;
          const targetNode = rawByName.get(asString(target.node));
          if (!targetNode || !orderById.has(targetNode.id)) continue;

          const targetIndex = asFiniteNumber(target.index, 0);
          const id = `${sourceNode.id}::${port}::${sourceIndex}->${targetNode.id}::${targetIndex}`;
          if (seen.has(id)) continue;
          seen.add(id);

          edges.push({
            id,
            source: sourceNode.id,
            target: targetNode.id,
            kind: edgeKind(port),
            port,
            sourceIndex,
            targetIndex,
            label: edgeLabel(sourceNode, port, outputs.length, sourceIndex),
          });
        }
      });
    }
  }

  // Object key order is stable for a given JSON string but not guaranteed for a
  // programmatically built payload, so sort by canvas order instead.
  return edges.sort((a, b) => {
    const sourceDiff = (orderById.get(a.source) ?? 0) - (orderById.get(b.source) ?? 0);
    if (sourceDiff !== 0) return sourceDiff;
    if (a.port !== b.port) return a.port.localeCompare(b.port);
    if (a.sourceIndex !== b.sourceIndex) return a.sourceIndex - b.sourceIndex;
    const targetDiff = (orderById.get(a.target) ?? 0) - (orderById.get(b.target) ?? 0);
    if (targetDiff !== 0) return targetDiff;
    return a.targetIndex - b.targetIndex;
  });
}

function computeBounds(
  nodes: readonly CanvasNode[],
  stickies: readonly CanvasSticky[],
): CanvasBounds {
  const boxes = [...nodes, ...stickies];
  if (boxes.length === 0) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const box of boxes) {
    minX = Math.min(minX, box.x);
    minY = Math.min(minY, box.y);
    maxX = Math.max(maxX, box.x + box.width);
    maxY = Math.max(maxY, box.y + box.height);
  }
  return { minX, minY, maxX, maxY };
}

/** Parses a decoded n8n workflow export. Never throws. */
export function parseN8nWorkflow(input: unknown): WorkflowCanvasParseResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      error:
        "That does not look like a workflow export — paste the whole JSON object you downloaded from n8n.",
    };
  }

  const payload = findPayload(input);
  if (!payload) {
    return {
      ok: false,
      error:
        'That JSON has no "nodes" array — paste the full workflow export from n8n, not a single node.',
    };
  }

  const rawList = payload.nodes as unknown[];
  if (rawList.length > MAX_NODES) {
    return {
      ok: false,
      error: `That workflow has ${rawList.length} nodes. The canvas supports up to ${MAX_NODES} — please paste a smaller workflow.`,
    };
  }

  const rawNodes = readRawNodes(rawList);
  if (rawNodes.length === 0 && rawList.length > 0) {
    return {
      ok: false,
      error:
        'The "nodes" array does not contain any readable nodes — re-copy the export from n8n and try again.',
    };
  }

  const connections = isRecord(payload.connections) ? payload.connections : {};
  const aiOnlySources = findAiOnlySources(connections);

  const stickies = readStickies(rawNodes);
  const graphNodes = rawNodes.filter((node) => node.typeKey !== "stickynote");

  const nodes: CanvasNode[] = graphNodes.map((node) => {
    const shape = deriveShape(node, aiOnlySources);
    // Attachments shrink, but their authored top-left stays put.
    const size = shape === "attachment" ? ATTACHMENT_SIZE : NODE_SIZE;
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      typeKey: node.typeKey,
      shape,
      x: node.x,
      y: node.y,
      width: size,
      height: size,
      subtitle: deriveSubtitle(node.parameters),
      disabled: node.disabled,
    };
  });

  // Names are the connection key; last writer wins on a duplicate, matching n8n.
  const rawByName = new Map<string, RawNode>();
  for (const node of graphNodes) rawByName.set(node.name, node);

  const orderById = new Map<string, number>();
  nodes.forEach((node, index) => {
    if (!orderById.has(node.id)) orderById.set(node.id, index);
  });

  const toolKeys: string[] = [];
  for (const node of nodes) {
    if (node.typeKey && !toolKeys.includes(node.typeKey)) toolKeys.push(node.typeKey);
  }

  const canvas: WorkflowCanvas = {
    version: 1,
    name: asString(payload.name) || asString(input.name),
    nodes,
    stickies,
    edges: buildEdges(connections, rawByName, orderById),
    bounds: computeBounds(nodes, stickies),
    toolKeys,
  };

  return { ok: true, canvas };
}

/** Parses the raw text an admin pasted. Syntax errors come back as messages. */
export function parseN8nWorkflowJson(text: string): WorkflowCanvasParseResult {
  if (text.trim() === "") {
    return { ok: false, error: "Paste the workflow JSON exported from n8n first." };
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error:
        "That is not valid JSON. Copy the workflow again from n8n (Download, or select all nodes and copy) and paste the whole thing.",
    };
  }

  return parseN8nWorkflow(decoded);
}

/** Stable empty canvas — handy for clearing a stored workflow. */
export function emptyWorkflowCanvas(): WorkflowCanvas {
  return {
    version: 1,
    name: "",
    nodes: [],
    stickies: [],
    edges: [],
    bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    toolKeys: [],
  };
}
