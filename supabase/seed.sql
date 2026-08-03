-- Baseline verified seed (no credentials).
-- Prefer `npm run db:seed` after migrations for full case-study graphs.
-- This SQL seeds profile, experience, capabilities, templates, and published case-study cores.

truncate table public.case_study_media cascade;
truncate table public.reliability_controls cascade;
truncate table public.case_study_tools cascade;
truncate table public.case_study_steps cascade;
truncate table public.case_studies cascade;
truncate table public.public_templates cascade;
truncate table public.capabilities cascade;
truncate table public.experience cascade;
truncate table public.profile cascade;
truncate table public.site_settings cascade;

insert into public.profile (
  full_name, professional_title, hero_headline, hero_description, short_bio, long_bio,
  location, availability_status, availability_label, email, linkedin_url, github_url,
  n8n_profile_url, credential_url, cv_url, portrait_url
) values (
  'Abdullah Dilshad',
  'AI Automation Engineer',
  'I build AI automation systems that replace manual work.',
  'AI Automation Engineer specializing in n8n, LLM workflows, REST APIs, and production business systems across lead generation, internal operations, customer support, and data workflows.',
  'AI Automation Engineer based in Islamabad, designing production workflows that connect AI models, APIs, and human approval processes.',
  array[
    'I''m Abdullah Dilshad, an AI Automation Engineer based in Islamabad, Pakistan. I design production workflows that connect AI models, APIs, business tools, and human approval processes.',
    'My work focuses on turning fragmented manual operations into reliable systems that teams can understand, monitor, and maintain. I have delivered paid workflows across lead generation, internal operations, inbox management, customer support, reporting, and content operations.',
    'I hold a BS in Computer Science from FAST-NUCES and have completed n8n Course Level 2. I am currently open to international remote employment and long-term contract opportunities.'
  ],
  'Islamabad, Pakistan',
  'available',
  'Available for Remote Work',
  'abdullahdilshad111@gmail.com',
  'https://www.linkedin.com/in/abdullah-dilshad',
  null,
  'https://n8n.io/creators/abdullahmil/',
  'https://community.n8n.io/badges/105/completed-n8n-course-level-2?username=abdullahmil',
  '/resume',
  null
);

insert into public.experience (
  organization, role, location, start_date, end_date, is_current, description, display_order, is_published
) values
(
  'AiMark Labs',
  'AI Automation Engineer',
  'Islamabad, Pakistan',
  '2025-08-01',
  null,
  true,
  'Designs and deploys AI-powered automation systems for lead generation, internal operations, content workflows, client reporting, and API-connected business processes.',
  0,
  true
),
(
  'Independent Clients',
  'n8n Developer and AI Automation Engineer',
  'Remote',
  '2024-08-01',
  '2025-04-01',
  false,
  'Delivered paid production workflows across lead generation, inbox management, customer support, data synchronization, and business process automation.',
  1,
  true
),
(
  'n8n Official Template Library',
  'Workflow Template Creator',
  'Remote',
  '2024-01-01',
  null,
  true,
  'Publishes reusable automation templates for the n8n community, with three currently listed public workflows.',
  2,
  true
);

insert into public.public_templates (
  title, description, external_url, tools, accent, display_order, is_published
) values
(
  'Get a daily cybersecurity news digest on Telegram and Slack with GPT-4',
  'Public n8n template that aggregates cybersecurity news into a daily digest delivered to Telegram and Slack.',
  'https://n8n.io/creators/abdullahmil/',
  array['n8n', 'GPT-4', 'Telegram', 'Slack'],
  'primary',
  0,
  true
),
(
  'Automated form response system with Google Sheets, Slack, Gmail and Contacts',
  'Public n8n template for capturing form submissions and coordinating responses across Sheets, Slack, Gmail, and Contacts.',
  'https://n8n.io/creators/abdullahmil/',
  array['n8n', 'Google Sheets', 'Slack', 'Gmail'],
  'secondary',
  1,
  true
),
(
  'Transcribe and summarize audio with Whisper, from Google Drive to Notion',
  'Public n8n template that transcribes audio from Google Drive with Whisper and writes summaries to Notion.',
  'https://n8n.io/creators/abdullahmil/',
  array['n8n', 'Whisper', 'Google Drive', 'Notion'],
  'tertiary',
  2,
  true
);

insert into public.site_settings (setting_key, setting_value)
values (
  'availability',
  '{"status":"available","label":"Available for Remote Work"}'::jsonb
);

-- Case study cores (full nested rows via npm run db:seed)
insert into public.case_studies (
  title, slug, summary, business_problem, before_state, before_issues,
  architecture_description, architecture_nodes, contribution, result,
  accent, preview_label, status, is_featured, display_order, published_at, seo_title, seo_description
) values
(
  'AI Lead Generation and Outreach Engine',
  'ai-lead-generation-outreach-engine',
  'An end-to-end workflow connecting prospect discovery, enrichment, LLM personalization, email delivery, reply detection, duplicate prevention, and structured CRM output.',
  'Prospect discovery, enrichment, personalization, outreach, and CRM updates depended on disconnected manual steps.',
  'Lead data moved between research tools, spreadsheets, email, and manual follow-up without one traceable workflow.',
  '[]'::jsonb,
  'A multi-stage n8n workflow that moves prospects from discovery through enrichment, AI-assisted qualification and personalization, optional human review, Gmail outreach, reply detection, and structured CRM or spreadsheet updates.',
  '[]'::jsonb,
  '[]'::jsonb,
  'Replaced a fragmented manual process with a scheduled and traceable automation system that handles prospect data, personalization, outreach operations, and CRM updates with minimal manual intervention.',
  'primary',
  'Lead Gen Architecture',
  'published',
  true,
  0,
  timezone('utc', now()),
  'AI Lead Generation and Outreach Engine',
  'An end-to-end workflow connecting prospect discovery, enrichment, LLM personalization, email delivery, reply detection, duplicate prevention, and structured CRM output.'
),
(
  'Internal Operations Automation System',
  'internal-operations-automation-system',
  'A cross-team automation system for task routing, Slack notifications, CRM updates, status reporting, content approvals, and operational coordination.',
  'Assignments, approvals, updates, and reporting depended on fragmented messages and repeated manual follow-up.',
  'Work moved between direct messages, spreadsheets, email, and verbal updates without a consistent operating process.',
  '[]'::jsonb,
  'An event-driven n8n system that validates incoming requests, classifies work, assigns owners, notifies teams in Slack, tracks approval and status, updates CRM or Google Sheets, and produces completion reports with error notifications.',
  '[]'::jsonb,
  '[]'::jsonb,
  'Converted disconnected team handoffs into a consistent event-driven process with clearer ownership, approval states, and faster system updates.',
  'secondary',
  'Ops Pipeline Visual',
  'published',
  true,
  1,
  timezone('utc', now()),
  'Internal Operations Automation System',
  'A cross-team automation system for task routing, Slack notifications, CRM updates, status reporting, content approvals, and operational coordination.'
),
(
  'RAG Customer Support Workflow',
  'rag-customer-support-workflow',
  'A knowledge-grounded support workflow that retrieves relevant context, generates responses, evaluates routing confidence, and escalates unresolved cases to humans.',
  'Common support questions required repeated manual knowledge lookup and response preparation.',
  'Messages were reviewed manually, answers were searched from internal content, and difficult cases were escalated inconsistently.',
  '[]'::jsonb,
  'A knowledge-grounded support workflow that normalizes the customer query, retrieves relevant context from a vector knowledge base, assembles grounded prompts, generates a draft response, evaluates confidence, and either replies or escalates to a human with Slack or email notification and interaction logging.',
  '[]'::jsonb,
  '[]'::jsonb,
  'Created a repeatable support workflow that automates knowledge retrieval and response preparation while preserving human control for uncertain cases.',
  'tertiary',
  'RAG System Schematic',
  'published',
  true,
  2,
  timezone('utc', now()),
  'RAG Customer Support Workflow',
  'A knowledge-grounded support workflow that retrieves relevant context, generates responses, evaluates routing confidence, and escalates unresolved cases to humans.'
);

-- Unpublished draft example to validate RLS (must not be publicly readable)
insert into public.case_studies (
  title, slug, summary, status, display_order, accent, preview_label
) values (
  'Draft Only Example',
  'draft-only-example',
  'This draft exists to verify that unpublished case studies are not publicly readable.',
  'draft',
  99,
  'primary',
  'Draft'
);
