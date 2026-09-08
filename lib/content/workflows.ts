/**
 * Portfolio-safe workflow catalog derived from the connected n8n instance.
 * Public copy is client-agnostic and outcome-oriented — no brand names,
 * credentials, webhook URLs, or implementation dumps.
 */

export type WorkflowListing = {
  id: string;
  title: string;
  summary: string;
  category: string;
  outcomeTags?: string[];
  active?: boolean;
};

export type WorkflowGroup = {
  category: string;
  description: string;
  items: WorkflowListing[];
};

export const workflowGroups: WorkflowGroup[] = [
  {
    category: "Lead Generation & Outreach",
    description:
      "Systems that find prospects, qualify fit, and run reliable outbound without manual copy-paste.",
    items: [
      {
        id: "prospect-discovery-engine",
        title: "Prospect Discovery Engine",
        summary:
          "Builds targeted prospect lists from public business sources so sales teams start with fresher, higher-volume pipeline instead of manual research.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Lead gen", "Pipeline"],
        active: true,
      },
      {
        id: "ai-lead-qualification",
        title: "AI Lead Qualification & Scoring",
        summary:
          "Scores and filters inbound or discovered leads by fit so reps spend time on accounts most likely to convert.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Qualification", "Focus"],
        active: true,
      },
      {
        id: "personalized-cold-outreach",
        title: "Personalized Cold Outreach",
        summary:
          "Turns qualified leads into tailored first-touch emails at scale, reducing drafting time while keeping messaging specific.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Outreach", "Personalization"],
        active: true,
      },
      {
        id: "multistep-follow-up-sequences",
        title: "Multi-Step Follow-Up Sequences",
        summary:
          "Runs timed follow-ups across a cadence so warm leads are not lost to inconsistent manual chasing.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Nurture", "Consistency"],
        active: true,
      },
      {
        id: "reply-detection-routing",
        title: "Reply Detection & CRM Routing",
        summary:
          "Catches prospect replies and updates pipeline status automatically so interested leads get a fast human handoff.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Inbox", "CRM"],
        active: true,
      },
      {
        id: "outreach-ops-dashboard",
        title: "Outreach Ops Dashboard Feed",
        summary:
          "Aggregates campaign health into an ops view so teams can see volume, bottlenecks, and next actions without spreadsheet archaeology.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Visibility", "Ops"],
        active: true,
      },
      {
        id: "whatsapp-campaign-launcher",
        title: "WhatsApp Campaign Launcher",
        summary:
          "Starts coordinated messaging runs from a controlled trigger so outreach teams can launch campaigns without rewiring each send.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Messaging", "Launch"],
        active: false,
      },
      {
        id: "competitive-pitch-audit",
        title: "Competitive Pitch Audit Pack",
        summary:
          "Researches a prospect’s web and social presence and produces a ready-to-send audit PDF that shortens sales prep and strengthens pitches.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Sales enablement", "Research"],
        active: false,
      },
      {
        id: "personalized-business-audit-engine",
        title: "Personalized Business Audit Engine",
        summary:
          "Generates tailored audit deliverables for prospects so the team can offer high-value first touches without hours of manual analysis.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Audits", "Conversion"],
        active: true,
      },
      {
        id: "local-business-prospecting",
        title: "Local Business Prospecting Lists",
        summary:
          "Assembles local-business prospect lists with contactable details to accelerate territory-style outbound campaigns.",
        category: "Lead Generation & Outreach",
        outcomeTags: ["Local lead gen", "Lists"],
        active: false,
      },
    ],
  },
  {
    category: "Revenue Ops & Employer Outreach",
    description:
      "Pipelines that keep job, employer, and outreach data moving so revenue teams spend less time on sync and list work.",
    items: [
      {
        id: "job-listing-ingest-publish",
        title: "Job Listing Ingest & Publish Pipeline",
        summary:
          "Scrapes, normalizes, and maps job listings into a publishable structure so openings stay current without manual re-entry.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Jobs", "Data ops"],
        active: true,
      },
      {
        id: "job-scrape-notify-upload",
        title: "Job Scrape, Notify & Upload Flow",
        summary:
          "End-to-end job processing that collects openings, alerts stakeholders, and uploads structured records to reduce lag between discovery and distribution.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Jobs", "Alerts"],
        active: false,
      },
      {
        id: "employer-sync-email-outreach",
        title: "Employer Sync & Email Outreach",
        summary:
          "Syncs employer records into a durable store and runs outbound email campaigns so recruiting or partnership teams can scale contact without spreadsheet chaos.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Employers", "Outreach"],
        active: true,
      },
      {
        id: "high-volume-list-filler",
        title: "High-Volume Prospect List Filler",
        summary:
          "Fills employer or prospect sheets to a target count so campaigns launch with enough volume instead of waiting on manual research.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Scale", "Lists"],
        active: true,
      },
      {
        id: "outreach-sheet-scaffolding",
        title: "Outreach Sheet Scaffolding",
        summary:
          "Bootstraps campaign-ready sheets and columns so new outbound programs start structured and consistent.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Setup", "Ops"],
        active: true,
      },
      {
        id: "outbound-queue-runner",
        title: "Outbound Queue Runner",
        summary:
          "Processes queued outreach work in controlled batches so high-volume sends stay reliable and measurable.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Queue", "Reliability"],
        active: true,
      },
      {
        id: "employer-research-agent",
        title: "Employer Research Agent",
        summary:
          "Assists with employer research and enrichment so outreach lists are more complete before a human sends.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Research", "Enrichment"],
        active: false,
      },
      {
        id: "job-contact-enrichment",
        title: "Job Contact Enrichment",
        summary:
          "Enriches job-related contacts with better reachability data to improve outbound hit rates and reduce bounced sends.",
        category: "Revenue Ops & Employer Outreach",
        outcomeTags: ["Enrichment", "Deliverability"],
        active: false,
      },
    ],
  },
  {
    category: "Hiring & Talent Screening",
    description:
      "Applicant intake and AI-assisted screening that cuts time-to-shortlist while keeping HR in control.",
    items: [
      {
        id: "job-posting-creator",
        title: "Job Posting Creator",
        summary:
          "Turns hiring inputs into structured job posts quickly so open roles go live without repetitive admin work.",
        category: "Hiring & Talent Screening",
        outcomeTags: ["Hiring", "Speed"],
        active: true,
      },
      {
        id: "apply-and-screen",
        title: "Apply & Screen Pipeline",
        summary:
          "Captures applications and runs first-pass screening so recruiters see prioritized candidates instead of raw inbox volume.",
        category: "Hiring & Talent Screening",
        outcomeTags: ["Screening", "Throughput"],
        active: true,
      },
      {
        id: "ai-screening-engine",
        title: "AI Screening Engine",
        summary:
          "Central scoring logic that evaluates candidates against role criteria to reduce manual resume triage time.",
        category: "Hiring & Talent Screening",
        outcomeTags: ["AI screening", "Consistency"],
        active: true,
      },
      {
        id: "hr-review-portal",
        title: "HR Review Portal",
        summary:
          "Gives hiring teams a review surface for screened applicants so decisions stay fast, visible, and auditable.",
        category: "Hiring & Talent Screening",
        outcomeTags: ["HR ops", "Visibility"],
        active: true,
      },
    ],
  },
  {
    category: "Content & Social Publishing",
    description:
      "Calendar-to-publish systems with approval gates so marketing ships on schedule with less chase.",
    items: [
      {
        id: "content-calendar-generation",
        title: "Content Calendar Generation",
        summary:
          "Produces scheduled content calendars so marketing plans weeks ahead instead of scrambling day-of.",
        category: "Content & Social Publishing",
        outcomeTags: ["Planning", "Calendar"],
        active: true,
      },
      {
        id: "designer-handoff-notifications",
        title: "Designer Handoff Notifications",
        summary:
          "Alerts design when assets are needed so creative work starts sooner and fewer posts miss their window.",
        category: "Content & Social Publishing",
        outcomeTags: ["Handoffs", "Speed"],
        active: false,
      },
      {
        id: "design-approval-workflow",
        title: "Design Approval Workflow",
        summary:
          "Routes creative for stakeholder approval so brand-safe content moves forward without endless chat threads.",
        category: "Content & Social Publishing",
        outcomeTags: ["Approvals", "Governance"],
        active: false,
      },
      {
        id: "approve-reject-gate",
        title: "Approve / Reject Publishing Gate",
        summary:
          "Captures go/no-go decisions and continues only approved assets, protecting brand while keeping throughput high.",
        category: "Content & Social Publishing",
        outcomeTags: ["Control", "Reliability"],
        active: true,
      },
      {
        id: "post-prep-for-publish",
        title: "Post Preparation for Publishing",
        summary:
          "Packages approved creative into channel-ready posts so schedulers do not rework assets by hand.",
        category: "Content & Social Publishing",
        outcomeTags: ["Ops", "Time saved"],
        active: false,
      },
      {
        id: "scheduled-social-publishing",
        title: "Scheduled Multi-Channel Social Publishing",
        summary:
          "Publishes approved posts to social channels on schedule so campaigns stay consistent without manual posting marathons. Production variants run across multiple brand accounts.",
        category: "Content & Social Publishing",
        outcomeTags: ["Publishing", "Consistency"],
        active: false,
      },
      {
        id: "weekly-marketing-performance-report",
        title: "Weekly Marketing Performance Report",
        summary:
          "Delivers a weekly performance digest to stakeholders so results are reviewed on a cadence without manual report pulls.",
        category: "Content & Social Publishing",
        outcomeTags: ["Reporting", "Accountability"],
        active: false,
      },
      {
        id: "customer-feedback-thank-you",
        title: "Customer Feedback Thank-You Emails",
        summary:
          "Sends personalized thank-you messages after feedback so customers feel heard and reviews keep coming in.",
        category: "Content & Social Publishing",
        outcomeTags: ["Retention", "CX"],
        active: true,
      },
      {
        id: "content-intake-approval",
        title: "Content Intake & Multi-Stage Approval",
        summary:
          "Takes content submissions through intake and approval stages so teams publish faster with clear ownership.",
        category: "Content & Social Publishing",
        outcomeTags: ["Intake", "Approvals"],
        active: true,
      },
      {
        id: "manager-approval-publish",
        title: "Manager Approval & Publish",
        summary:
          "Gives managers a final publish gate so brand-critical posts ship only after explicit sign-off.",
        category: "Content & Social Publishing",
        outcomeTags: ["Governance", "Publishing"],
        active: true,
      },
      {
        id: "social-channel-publisher",
        title: "Social Channel Publisher",
        summary:
          "Pushes approved creative to connected social channels so distribution is automatic once decisions are made.",
        category: "Content & Social Publishing",
        outcomeTags: ["Distribution", "Automation"],
        active: true,
      },
      {
        id: "blog-production-pipeline",
        title: "Blog Production Pipeline",
        summary:
          "Moves blog ideas from brief to publishable draft so content teams ship articles with less coordination overhead.",
        category: "Content & Social Publishing",
        outcomeTags: ["Content", "Throughput"],
        active: false,
      },
      {
        id: "weekly-topic-discovery",
        title: "Weekly Topic Discovery",
        summary:
          "Surfaces fresh content topics on a weekly rhythm so editorial calendars stay full without brainstorming from scratch.",
        category: "Content & Social Publishing",
        outcomeTags: ["Ideation", "Cadence"],
        active: false,
      },
      {
        id: "pm-blog-send-form",
        title: "PM Blog Send Form",
        summary:
          "Lets product or marketing leads submit and trigger blog sends from a simple form instead of chasing operators.",
        category: "Content & Social Publishing",
        outcomeTags: ["Self-serve", "Content ops"],
        active: true,
      },
      {
        id: "audio-story-content-generation",
        title: "Audio Story Content Generation",
        summary:
          "Produces short narrated stories for content channels so teams can expand formats without recording every piece manually.",
        category: "Content & Social Publishing",
        outcomeTags: ["Audio", "Content scale"],
        active: false,
      },
    ],
  },
  {
    category: "Lead Magnets & Nurture",
    description:
      "Capture, track, and nurture inbound interest so downloaded assets turn into booked conversations.",
    items: [
      {
        id: "lead-magnet-capture",
        title: "Lead Magnet Capture",
        summary:
          "Captures lead-magnet submissions into a structured list so every download becomes a followable opportunity.",
        category: "Lead Magnets & Nurture",
        outcomeTags: ["Inbound", "Capture"],
        active: true,
      },
      {
        id: "click-unsubscribe-tracking",
        title: "Click & Unsubscribe Tracking",
        summary:
          "Tracks engagement and opt-outs so nurture stays compliant and teams double down on what actually gets clicks.",
        category: "Lead Magnets & Nurture",
        outcomeTags: ["Engagement", "Compliance"],
        active: true,
      },
      {
        id: "nurture-sequence-sender",
        title: "Nurture Sequence Sender",
        summary:
          "Sends sequenced nurture messages after capture so warm inbound leads are worked systematically, not forgotten.",
        category: "Lead Magnets & Nurture",
        outcomeTags: ["Nurture", "Conversion"],
        active: false,
      },
      {
        id: "weekly-lead-digest",
        title: "Weekly Lead Digest",
        summary:
          "Summarizes weekly lead and campaign activity for stakeholders so pipeline health is visible without manual status pulls.",
        category: "Lead Magnets & Nurture",
        outcomeTags: ["Reporting", "Visibility"],
        active: true,
      },
    ],
  },
  {
    category: "Research & Analyst Deliverables",
    description:
      "Research-to-deliverable systems that turn company inputs into analyst-ready outputs and stakeholder decks.",
    items: [
      {
        id: "company-research-analyst-pipeline",
        title: "Company Research & Analyst Pipeline",
        summary:
          "Runs multi-stage company research, normalization, analysis, and QA so analyst deliverables ship faster with fewer manual handoffs. Includes production orchestration variants for public and private company paths.",
        category: "Research & Analyst Deliverables",
        outcomeTags: ["Research", "Delivery"],
        active: true,
      },
      {
        id: "analyst-run-portal-apis",
        title: "Analyst Run Portal & Status APIs",
        summary:
          "Exposes start, status, and result surfaces for analyst runs so operators can trigger and track work without touching internal graphs.",
        category: "Research & Analyst Deliverables",
        outcomeTags: ["Self-serve", "Ops"],
        active: true,
      },
      {
        id: "demo-form-to-presentation",
        title: "Demo Form to Presentation Deck",
        summary:
          "Turns a short intake form into a presentation-ready deck so demos and founder conversations start with polished materials, not blank slides.",
        category: "Research & Analyst Deliverables",
        outcomeTags: ["Sales enablement", "Speed"],
        active: true,
      },
      {
        id: "ratio-value-benchmark-modules",
        title: "Ratio, Value & Benchmark Modules",
        summary:
          "Produces financial snapshot, peer benchmark, and value-realization views that strengthen analyst recommendations with comparable context.",
        category: "Research & Analyst Deliverables",
        outcomeTags: ["Insights", "Benchmarks"],
        active: true,
      },
    ],
  },
  {
    category: "Operations & Internal Process",
    description:
      "Internal reliability, summaries, and process automation that keep delivery teams unblocked.",
    items: [
      {
        id: "daily-pm-task-summary",
        title: "Daily PM Task Summary",
        summary:
          "Collects completed work into a daily summary so project managers see progress without chasing updates across channels.",
        category: "Operations & Internal Process",
        outcomeTags: ["PM ops", "Visibility"],
        active: false,
      },
      {
        id: "publishing-error-handler",
        title: "Publishing Error Handler",
        summary:
          "Catches and routes publishing failures so broken runs surface quickly instead of silently missing scheduled posts.",
        category: "Operations & Internal Process",
        outcomeTags: ["Reliability", "Alerts"],
        active: false,
      },
      {
        id: "publishing-reliability-checks",
        title: "Publishing Reliability Checks",
        summary:
          "Runs controlled verification and reconciliation tests before or after live publishes to reduce failed posts and permission surprises.",
        category: "Operations & Internal Process",
        outcomeTags: ["QA", "Reliability"],
        active: false,
      },
      {
        id: "asset-setup-bootstrap",
        title: "Campaign Asset Setup Bootstrap",
        summary:
          "Creates the shared sheets and assets a campaign needs up front so launches are not delayed by one-off setup chores.",
        category: "Operations & Internal Process",
        outcomeTags: ["Setup", "Time saved"],
        active: false,
      },
    ],
  },
  {
    category: "Education Content Systems",
    description:
      "Document-to-question pipelines that expand study material coverage with measurable completeness.",
    items: [
      {
        id: "source-doc-question-generation",
        title: "Source Document → Question Generation",
        summary:
          "Ingests study source material and generates practice questions so education products expand coverage without writing every item by hand.",
        category: "Education Content Systems",
        outcomeTags: ["Content scale", "Education"],
        active: false,
      },
      {
        id: "civics-practice-generation",
        title: "Civics Practice Set Generation",
        summary:
          "Produces focused civics practice sets so learners get structured drills aligned to exam topics.",
        category: "Education Content Systems",
        outcomeTags: ["Practice", "Curriculum"],
        active: false,
      },
      {
        id: "content-coverage-report",
        title: "Content Coverage Report",
        summary:
          "Reports which topics still lack practice material so editorial effort targets real gaps instead of guesswork.",
        category: "Education Content Systems",
        outcomeTags: ["Coverage", "Prioritization"],
        active: false,
      },
      {
        id: "visual-practice-question-pack",
        title: "Visual Practice Question Pack",
        summary:
          "Builds visual-style practice questions into structured sheets so multimedia study formats can be reviewed and reused.",
        category: "Education Content Systems",
        outcomeTags: ["Visual content", "Ops"],
        active: false,
      },
    ],
  },
  {
    category: "Teaching & Training Demos",
    description:
      "Classroom and demo workflows used to teach automation patterns and AI agent basics.",
    items: [
      {
        id: "whatsapp-mini-crm-demo",
        title: "WhatsApp Mini-CRM Teaching Demo",
        summary:
          "A beginner-friendly demo that cleans and organizes messaging leads so students see how inbox chaos becomes a usable mini-CRM.",
        category: "Teaching & Training Demos",
        outcomeTags: ["Teaching", "CRM"],
        active: false,
      },
      {
        id: "smart-complaint-routing-demo",
        title: "Smart Complaint Routing Demo",
        summary:
          "Routes support-style complaints with AI assistance so learners practice triage that reduces response lag.",
        category: "Teaching & Training Demos",
        outcomeTags: ["Support", "Teaching"],
        active: true,
      },
      {
        id: "career-guidance-agent-demo",
        title: "Career Guidance Agent Demo",
        summary:
          "Shows an AI agent guiding career questions so students experience conversational automation with a clear learner outcome.",
        category: "Teaching & Training Demos",
        outcomeTags: ["Agents", "Teaching"],
        active: false,
      },
      {
        id: "quiz-grader-demo",
        title: "Student Quiz Grader Demo",
        summary:
          "Grades quiz submissions automatically so instructors spend less time on repetitive marking during workshops.",
        category: "Teaching & Training Demos",
        outcomeTags: ["Education", "Time saved"],
        active: false,
      },
      {
        id: "http-api-fundamentals-pack",
        title: "HTTP & API Fundamentals Class Pack",
        summary:
          "A set of class workflows teaching request basics, query params, POST bodies, and chaining so students can build real integrations confidently.",
        category: "Teaching & Training Demos",
        outcomeTags: ["Training", "Foundations"],
        active: false,
      },
      {
        id: "essential-nodes-masterclass",
        title: "Essential Nodes Masterclass",
        summary:
          "A guided masterclass workflow that walks through core automation building blocks used across production systems.",
        category: "Teaching & Training Demos",
        outcomeTags: ["Training", "Foundations"],
        active: false,
      },
    ],
  },
];

export const workflowListings: WorkflowListing[] = workflowGroups.flatMap(
  (group) => group.items,
);
