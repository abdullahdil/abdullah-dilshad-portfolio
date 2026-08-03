export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ContentStatus = "draft" | "published" | "archived";
export type AvailabilityStatus = "available" | "limited" | "unavailable";
export type ContactStatus = "unread" | "read" | "archived";
export type AccentTone = "primary" | "secondary" | "tertiary";

export type CaseStudyRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  client_label: string | null;
  industry: string | null;
  confidentiality_label: string | null;
  business_problem: string;
  before_state: string;
  before_issues: Json;
  architecture_description: string;
  architecture_nodes: Json;
  contribution: Json;
  result: string;
  accent: AccentTone;
  preview_label: string;
  featured_image_url: string | null;
  demo_video_url: string | null;
  status: ContentStatus;
  is_featured: boolean;
  display_order: number;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseStudyStepRow = {
  id: string;
  case_study_id: string;
  step_number: number;
  title: string;
  description: string;
};

export type CaseStudyToolRow = {
  id: string;
  case_study_id: string;
  name: string;
  category: string | null;
  display_order: number;
};

export type ReliabilityControlRow = {
  id: string;
  case_study_id: string;
  name: string;
  description: string;
  display_order: number;
};

export type CaseStudyMediaRow = {
  id: string;
  case_study_id: string;
  media_type: "image" | "video" | "embed" | "placeholder";
  storage_path: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  alt_text: string;
  caption: string;
  display_order: number;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  full_name: string;
  professional_title: string;
  hero_headline: string;
  hero_description: string;
  short_bio: string;
  long_bio: string[];
  location: string;
  availability_status: AvailabilityStatus;
  availability_label: string;
  email: string;
  linkedin_url: string | null;
  github_url: string | null;
  n8n_profile_url: string | null;
  credential_url: string | null;
  cv_url: string | null;
  portrait_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ExperienceRow = {
  id: string;
  organization: string;
  role: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  display_order: number;
  is_published: boolean;
};

export type CapabilityRow = {
  id: string;
  category: string;
  name: string;
  description: string;
  display_order: number;
  is_published: boolean;
};

export type PublicTemplateRow = {
  id: string;
  title: string;
  description: string;
  external_url: string;
  preview_image_url: string | null;
  engagement_count: number | null;
  tools: string[];
  accent: AccentTone;
  display_order: number;
  is_published: boolean;
};

export type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  opportunity_type: string;
  message: string;
  status: ContactStatus;
  created_at: string;
};

export type SiteSettingRow = {
  id: string;
  setting_key: string;
  setting_value: Json;
  updated_at: string;
};
