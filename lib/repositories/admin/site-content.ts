import type {
  HeroWorkflowStepRow,
  NavLinkRow,
  ProofPointRow,
  WorkflowGroupRow,
  WorkflowRow,
} from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  HeroWorkflowStepInput,
  NavLinkInput,
  ProofPointInput,
  WorkflowGroupInput,
  WorkflowInput,
} from "@/lib/validations/site-content";

async function requireClient() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

// ---------------------------------------------------------------------------
// Proof points
// ---------------------------------------------------------------------------

function proofPointColumns(input: ProofPointInput) {
  return {
    value: input.value,
    label: input.label,
    is_featured: input.isFeatured,
    display_order: input.displayOrder,
    is_published: input.isPublished,
  };
}

export async function listAdminProofPoints(): Promise<ProofPointRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("proof_points")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProofPointRow[];
}

export async function createAdminProofPoint(
  input: ProofPointInput,
): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("proof_points")
    .insert(proofPointColumns(input))
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminProofPoint(
  id: string,
  input: ProofPointInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("proof_points")
    .update(proofPointColumns(input))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminProofPoint(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("proof_points").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Hero workflow steps
// ---------------------------------------------------------------------------

function heroStepColumns(input: HeroWorkflowStepInput) {
  return {
    title: input.title,
    description: input.description,
    icon: input.icon,
    display_order: input.displayOrder,
    is_published: input.isPublished,
  };
}

export async function listAdminHeroWorkflowSteps(): Promise<
  HeroWorkflowStepRow[]
> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("hero_workflow_steps")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as HeroWorkflowStepRow[];
}

export async function createAdminHeroWorkflowStep(
  input: HeroWorkflowStepInput,
): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("hero_workflow_steps")
    .insert(heroStepColumns(input))
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminHeroWorkflowStep(
  id: string,
  input: HeroWorkflowStepInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("hero_workflow_steps")
    .update(heroStepColumns(input))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminHeroWorkflowStep(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("hero_workflow_steps")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Nav links
// ---------------------------------------------------------------------------

function navLinkColumns(input: NavLinkInput) {
  return {
    href: input.href,
    label: input.label,
    display_order: input.displayOrder,
    is_published: input.isPublished,
  };
}

export async function listAdminNavLinks(): Promise<NavLinkRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("nav_links")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as NavLinkRow[];
}

export async function createAdminNavLink(input: NavLinkInput): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("nav_links")
    .insert(navLinkColumns(input))
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminNavLink(
  id: string,
  input: NavLinkInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("nav_links")
    .update(navLinkColumns(input))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminNavLink(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("nav_links").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Workflow groups
// ---------------------------------------------------------------------------

function workflowGroupColumns(input: WorkflowGroupInput) {
  return {
    category: input.category,
    description: input.description,
    display_order: input.displayOrder,
    is_published: input.isPublished,
  };
}

export async function listAdminWorkflowGroups(): Promise<WorkflowGroupRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("workflow_groups")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WorkflowGroupRow[];
}

export async function createAdminWorkflowGroup(
  input: WorkflowGroupInput,
): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("workflow_groups")
    .insert(workflowGroupColumns(input))
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminWorkflowGroup(
  id: string,
  input: WorkflowGroupInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("workflow_groups")
    .update(workflowGroupColumns(input))
    .eq("id", id);
  if (error) throw error;
}

/** Deleting a group cascades to its workflows (FK on delete cascade). */
export async function deleteAdminWorkflowGroup(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("workflow_groups").delete().eq("id", id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

function workflowColumns(input: WorkflowInput) {
  return {
    group_id: input.groupId,
    slug: input.slug,
    title: input.title,
    summary: input.summary,
    image_url: input.imageUrl || null,
    image_alt: input.imageAlt,
    outcome_tags: input.outcomeTags,
    is_active: input.isActive,
    display_order: input.displayOrder,
    is_published: input.isPublished,
  };
}

export async function listAdminWorkflows(): Promise<WorkflowRow[]> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("workflows")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WorkflowRow[];
}

export async function createAdminWorkflow(
  input: WorkflowInput,
): Promise<string> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("workflows")
    .insert(workflowColumns(input))
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAdminWorkflow(
  id: string,
  input: WorkflowInput,
): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("workflows")
    .update(workflowColumns(input))
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminWorkflow(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase.from("workflows").delete().eq("id", id);
  if (error) throw error;
}

/** Reads just the stored image URL, for cleanup before clearing it. */
export async function getAdminWorkflowImageUrl(
  id: string,
): Promise<string | null> {
  const supabase = await requireClient();
  const { data, error } = await supabase
    .from("workflows")
    .select("image_url")
    .eq("id", id)
    .single();
  if (error) throw error;
  return (data?.image_url as string | null) ?? null;
}

export async function clearAdminWorkflowImage(id: string): Promise<void> {
  const supabase = await requireClient();
  const { error } = await supabase
    .from("workflows")
    .update({ image_url: null, image_alt: "" })
    .eq("id", id);
  if (error) throw error;
}
