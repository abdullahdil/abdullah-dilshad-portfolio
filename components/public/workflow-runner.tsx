"use client";

import {
  Bot,
  Brain,
  Check,
  Database,
  Filter,
  Mail,
  Play,
  Plug,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Terminal,
  UserCheck,
  Webhook,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { PublicHeroWorkflowStep } from "@/lib/repositories/site-content";
import { cn } from "@/lib/utils";

const iconMap: Record<PublicHeroWorkflowStep["icon"], LucideIcon> = {
  Webhook,
  Database,
  Brain,
  UserCheck,
  Send,
  Workflow,
  Plug,
  Terminal,
  Bot,
  Filter,
  Mail,
  ShieldCheck,
};

type StepStatus =
  | "pending"
  | "active"
  | "retrying"
  | "waiting"
  | "done"
  | "rejected"
  | "skipped";

type RunPhase = "idle" | "running" | "awaiting" | "halted" | "complete";

type LogTone = "muted" | "accent" | "warning" | "error" | "success";

type LogLine = {
  id: number;
  text: string;
  tone: LogTone;
};

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

const MAX_LOG_LINES = 40;

/**
 * The approval pause must not depend on a step literally being called
 * "Human Approval" — the step list is admin-editable at /admin/hero-workflow.
 * So: match case-insensitively on approval/approve/review/sign-off/human, and
 * if nothing matches, fall back to the second-to-last step (the conventional
 * gate immediately before the irreversible business action). With fewer than
 * two steps there is no meaningful gate, so the run has no pause at all.
 */
function findApprovalIndex(steps: PublicHeroWorkflowStep[]): number {
  if (steps.length < 2) return -1;

  const matched = steps.findIndex((step) =>
    /approv|review|sign[-\s]?off|human|manual/i.test(
      `${step.title} ${step.description}`,
    ),
  );

  return matched === -1 ? steps.length - 2 : matched;
}

/**
 * The simulated failure lands on a mid-pipeline step — never the approval gate
 * (a person is not a retryable dependency) and never the final action.
 */
function findFailureIndex(
  steps: PublicHeroWorkflowStep[],
  approvalIndex: number,
): number {
  const candidates = steps
    .map((_, index) => index)
    .filter(
      (index) =>
        index !== approvalIndex &&
        index !== steps.length - 1 &&
        (steps.length <= 2 || index > 0),
    );

  if (candidates.length === 0) return -1;
  return candidates[Math.floor((candidates.length - 1) / 2)] ?? -1;
}

/**
 * Illustrative, deterministic durations. An LLM call reads as slower than a
 * webhook because that is true of real pipelines — but these are scripted
 * constants, not measurements, and the UI says so.
 */
function stepDuration(step: PublicHeroWorkflowStep, index: number): number {
  const text = `${step.title} ${step.description}`.toLowerCase();
  if (/(\bai\b|llm|model|gpt|claude|classif|decision|summar|generat|draft|qualif|rag|agent)/.test(text)) {
    return 1750;
  }
  if (/(enrich|lookup|fetch|scrape|search|normali|validat|transform|database)/.test(text)) {
    return 1150;
  }
  if (/(trigger|webhook|schedul|event|intake)/.test(text)) {
    return 550;
  }
  return 750 + (index % 3) * 160;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const boxClasses: Record<StepStatus, string> = {
  pending: "border-outline-variant bg-surface-high text-on-surface-faint",
  active: "border-accent bg-accent-soft text-accent",
  retrying: "border-warning bg-surface-high text-warning",
  waiting: "border-accent bg-accent-soft text-accent",
  done: "border-outline-variant bg-surface-high text-accent",
  rejected: "border-outline-strong bg-surface-high text-on-surface-variant",
  skipped: "border-outline-variant bg-surface-high text-on-surface-faint",
};

const titleClasses: Record<StepStatus, string> = {
  pending: "text-on-surface-variant",
  active: "text-on-surface",
  retrying: "text-on-surface",
  waiting: "text-on-surface",
  done: "text-on-surface",
  rejected: "text-on-surface-variant",
  skipped: "text-on-surface-faint",
};

const logToneClasses: Record<LogTone, string> = {
  muted: "text-on-surface-faint",
  accent: "text-accent",
  warning: "text-warning",
  error: "text-on-surface-variant",
  success: "text-on-surface",
};

const statusNote: Partial<Record<StepStatus, string>> = {
  active: "running",
  retrying: "retry 1/3",
  waiting: "awaiting you",
  done: "done",
  rejected: "rejected",
  skipped: "not run",
};

type WorkflowRunnerProps = {
  steps: PublicHeroWorkflowStep[];
  className?: string;
  compact?: boolean;
};

export function WorkflowRunner({
  steps,
  className,
  compact = false,
}: WorkflowRunnerProps) {
  const approvalIndex = findApprovalIndex(steps);
  const failureIndex = findFailureIndex(steps, approvalIndex);

  const [statuses, setStatuses] = useState<StepStatus[]>(() =>
    steps.map(() => "pending" as StepStatus),
  );
  const [phase, setPhase] = useState<RunPhase>("idle");
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [log, setLog] = useState<LogLine[]>([]);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);
  const logIdRef = useRef(0);
  const logBoxRef = useRef<HTMLDivElement | null>(null);

  // Cleanup only — no state is set inside this effect body. Bumping the run id
  // also invalidates any callback that was already queued.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      timerRef.current = null;
      runIdRef.current += 1;
    };
  }, []);

  function clearTimer() {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function appendLog(text: string, tone: LogTone = "muted") {
    logIdRef.current += 1;
    const entry: LogLine = { id: logIdRef.current, text, tone };
    setLog((previous) => [...previous, entry].slice(-MAX_LOG_LINES));

    const box = logBoxRef.current;
    if (box) {
      requestAnimationFrame(() => {
        box.scrollTop = box.scrollHeight;
      });
    }
  }

  function setStatusAt(index: number, status: StepStatus) {
    setStatuses((previous) => {
      const next = [...previous];
      next[index] = status;
      return next;
    });
  }

  function label(index: number) {
    return `[${String(index + 1).padStart(2, "0")}] ${steps[index]?.title ?? ""}`;
  }

  /**
   * One timer at a time, each guarded by the run id so a Reset (or unmount)
   * cannot land a state update from an abandoned run. Under reduced motion the
   * delays collapse to zero: states still advance in order, just instantly.
   */
  function schedule(runId: number, delay: number, fn: () => void) {
    clearTimer();
    const reduced = prefersReducedMotion();
    timerRef.current = setTimeout(
      () => {
        timerRef.current = null;
        if (runIdRef.current !== runId) return;
        fn();
      },
      reduced ? 0 : delay,
    );
  }

  function advance(runId: number, index: number) {
    if (runIdRef.current !== runId) return;

    if (index >= steps.length) {
      setPhase("complete");
      appendLog(
        `run complete — ${steps.length}/${steps.length} steps finished`,
        "success",
      );
      return;
    }

    if (index === approvalIndex) {
      setStatusAt(index, "waiting");
      setPhase("awaiting");
      appendLog(`${label(index)} — awaiting human approval`, "accent");
      return;
    }

    setStatusAt(index, "active");
    appendLog(`${label(index)} — started`);

    const duration = stepDuration(steps[index], index);

    if (simulateFailure && index === failureIndex) {
      schedule(runId, duration, () => {
        setStatusAt(index, "retrying");
        appendLog(
          `${label(index)} — step failed (simulated) · retry 1/3 scheduled`,
          "warning",
        );
        schedule(runId, 950, () => {
          setStatusAt(index, "done");
          appendLog(`${label(index)} — recovered on retry 1`, "success");
          advance(runId, index + 1);
        });
      });
      return;
    }

    schedule(runId, duration, () => {
      setStatusAt(index, "done");
      appendLog(`${label(index)} — completed`);
      advance(runId, index + 1);
    });
  }

  function handleRun() {
    clearTimer();
    runIdRef.current += 1;
    const runId = runIdRef.current;

    setStatuses(steps.map(() => "pending" as StepStatus));
    setPhase("running");

    logIdRef.current = 1;
    setLog([
      {
        id: 1,
        text: simulateFailure
          ? "run started — simulated, failure injection ON"
          : "run started — simulated",
        tone: "accent",
      },
    ]);

    advance(runId, 0);
  }

  function handleReset() {
    clearTimer();
    runIdRef.current += 1;
    setStatuses(steps.map(() => "pending" as StepStatus));
    setPhase("idle");
    setLog([]);
    logIdRef.current = 0;
  }

  function handleApprove() {
    if (phase !== "awaiting" || approvalIndex === -1) return;
    const runId = runIdRef.current;
    setPhase("running");
    setStatusAt(approvalIndex, "done");
    appendLog(`${label(approvalIndex)} — approved by you`, "success");
    advance(runId, approvalIndex + 1);
  }

  function handleReject() {
    if (phase !== "awaiting" || approvalIndex === -1) return;
    clearTimer();
    runIdRef.current += 1;
    setStatuses((previous) =>
      previous.map((status, index) => {
        if (index === approvalIndex) return "rejected";
        if (index > approvalIndex) return "skipped";
        return status;
      }),
    );
    setPhase("halted");
    appendLog(`${label(approvalIndex)} — rejected by you`, "warning");
    appendLog(
      "run halted — downstream action never fired, no external system touched",
      "error",
    );
  }

  function toggleFailure() {
    setSimulateFailure((previous) => !previous);
  }

  const isBusy = phase === "running";
  const runLabel = phase === "idle" ? "Run workflow" : "Run again";

  return (
    <div className={cn("panel panel-depth", className)}>
      {/* ---- header: identity + the honesty label + failure toggle ---- */}
      <div className="flex flex-col gap-3 border-b border-outline-variant px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="min-w-0">
          <p className="font-label text-on-surface-faint">
            Pipeline
            <span aria-hidden className="mx-2">
              /
            </span>
            <span className="tabular">
              {String(steps.length).padStart(2, "0")}
            </span>{" "}
            steps
          </p>
          <p className="mt-1 font-label text-on-surface-faint">
            Simulated run — illustrative timings
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={simulateFailure}
          onClick={toggleFailure}
          className={cn(
            "inline-flex shrink-0 items-center gap-2.5 self-start rounded-full border px-3 py-1.5 transition-colors duration-200",
            EASE,
            simulateFailure
              ? "border-warning bg-surface-high text-on-surface"
              : "border-outline-variant bg-surface-high text-on-surface-variant hover:border-outline-strong",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "relative h-3.5 w-6 rounded-full border transition-colors duration-200",
              simulateFailure
                ? "border-warning bg-warning"
                : "border-outline-strong bg-surface-container",
            )}
          >
            <span
              className={cn(
                "absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full transition-[left] duration-200",
                EASE,
                simulateFailure
                  ? "left-[0.8125rem] bg-surface"
                  : "left-[0.1875rem] bg-on-surface-faint",
              )}
            />
          </span>
          <span className="font-label">Simulate failure</span>
        </button>
      </div>

      {/* ---- the nodes ---- */}
      <ol
        className={cn(
          "grid grid-cols-1 md:auto-cols-fr md:grid-flow-col",
          compact ? "px-5 py-5 md:px-6" : "px-5 py-6 md:px-6 md:py-8",
        )}
      >
        {steps.map((node, index) => {
          const Icon = iconMap[node.icon] ?? Workflow;
          const status = statuses[index] ?? "pending";
          const isLast = index === steps.length - 1;
          const connectorFilled = status === "done";
          const note = statusNote[status];

          let StatusIcon: LucideIcon | null = null;
          if (status === "done") StatusIcon = Check;
          else if (status === "retrying") StatusIcon = RefreshCw;
          else if (status === "rejected") StatusIcon = X;

          return (
            <li
              key={`${node.title}-${index}`}
              className="relative flex gap-3.5 pb-7 last:pb-0 md:block md:gap-0 md:pb-0"
            >
              {/* Stacked connector (mobile): vertical rule under the icon. */}
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute top-8 bottom-1 left-3.5 w-px -translate-x-1/2 overflow-hidden bg-outline-variant md:hidden"
                >
                  <span
                    className={cn(
                      "absolute inset-x-0 top-0 bg-accent transition-[height] duration-300",
                      EASE,
                      connectorFilled ? "h-full" : "h-0",
                    )}
                  />
                </span>
              ) : null}

              <div className="flex shrink-0 items-center md:mb-4">
                <span
                  className={cn(
                    "relative flex h-7 w-7 items-center justify-center rounded-md border transition-colors duration-300 md:h-8 md:w-8",
                    EASE,
                    boxClasses[status],
                  )}
                >
                  {StatusIcon ? (
                    <StatusIcon
                      className="h-3.5 w-3.5 md:h-4 md:w-4"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : (
                    <Icon
                      className="h-3.5 w-3.5 md:h-4 md:w-4"
                      strokeWidth={2}
                      aria-hidden
                    />
                  )}
                </span>

                {/* Inline connector (md+): runs from the node to the next node. */}
                {!isLast ? (
                  <span
                    aria-hidden
                    className="relative ml-3 hidden h-px flex-1 overflow-hidden bg-outline-variant md:block"
                  >
                    <span
                      className={cn(
                        "absolute inset-y-0 left-0 bg-accent transition-[width] duration-300",
                        EASE,
                        connectorFilled ? "w-full" : "w-0",
                      )}
                    />
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 md:pr-6">
                <p className="font-label tabular mb-1 flex items-center gap-2 text-on-surface-faint">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {note ? (
                    <span
                      className={cn(
                        status === "retrying" && "text-warning",
                        (status === "active" || status === "waiting") &&
                          "text-accent",
                      )}
                    >
                      {note}
                    </span>
                  ) : null}
                </p>
                <p
                  className={cn(
                    "text-body-sm font-medium transition-colors duration-300",
                    EASE,
                    titleClasses[status],
                  )}
                >
                  {node.title}
                </p>
                {!compact ? (
                  <p className="mt-1 max-w-[34ch] text-body-sm text-pretty text-on-surface-variant">
                    {node.description}
                  </p>
                ) : null}

                {/* The approval gate: the run genuinely stops here. */}
                {status === "waiting" ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={handleApprove}
                      aria-label={`Approve ${node.title} and continue the simulated run`}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReject}
                      aria-label={`Reject ${node.title} and halt the simulated run`}
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {/* ---- controls + execution trace ---- */}
      <div className="border-t border-outline-variant px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={handleRun} disabled={isBusy}>
            <Play className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {isBusy ? "Running…" : runLabel}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={phase === "idle"}
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Reset
          </Button>

          {phase === "awaiting" ? (
            <p className="font-label text-accent">Waiting on your decision</p>
          ) : null}
          {phase === "halted" ? (
            <p className="font-label text-on-surface-variant">
              Halted safely — final action skipped
            </p>
          ) : null}
        </div>

        <div
          ref={logBoxRef}
          aria-live="polite"
          aria-label="Simulated run log"
          tabIndex={0}
          className={cn(
            "mt-4 overflow-y-auto rounded-lg border border-outline-variant bg-surface-low px-4 py-3",
            compact ? "max-h-32" : "max-h-44",
          )}
        >
          {log.length === 0 ? (
            <p className="font-mono text-body-sm text-on-surface-faint">
              No run yet — press Run workflow.
            </p>
          ) : (
            <ol className="space-y-1">
              {log.map((line) => (
                <li
                  key={line.id}
                  className={cn(
                    "font-mono text-body-sm text-pretty break-words",
                    logToneClasses[line.tone],
                  )}
                >
                  {line.text}
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
