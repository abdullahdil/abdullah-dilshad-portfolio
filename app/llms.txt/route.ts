import { listPublishedCaseStudies } from "@/lib/repositories/case-studies";
import { getPublicProfile } from "@/lib/repositories/profile";
import { getSiteUrl, siteConfig } from "@/lib/site";

/** llms.txt (https://llmstxt.org): a short factual map of the site for LLM agents. */
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const site = getSiteUrl();
  const [profile, studies] = await Promise.all([
    getPublicProfile(),
    listPublishedCaseStudies(),
  ]);

  const links = [
    profile.linkedinUrl && `- LinkedIn: ${profile.linkedinUrl}`,
    profile.xUrl && `- X: ${profile.xUrl}`,
    profile.githubUrl && `- GitHub: ${profile.githubUrl}`,
    profile.n8nProfileUrl && `- n8n creator profile: ${profile.n8nProfileUrl}`,
  ].filter(Boolean);

  const body = [
    `# ${profile.fullName}`,
    "",
    `> ${siteConfig.identity}`,
    "",
    `Based in ${profile.location}. ${profile.shortBio}`,
    "",
    "Verified facts: approximately 30 paid production workflows; three publicly listed n8n templates; more than 3,800 combined visible engagements on the public n8n profile; n8n Course Level 2 completed; BS Computer Science, FAST-NUCES.",
    "",
    "## Pages",
    `- [Home](${site}/): profile, selected work, capabilities, contact`,
    `- [Work](${site}/work): case studies and the full workflow catalogue`,
    `- [Resume](${site}/resume): experience and downloadable CV`,
    "",
    "## Case studies",
    ...studies.map((s) => `- [${s.title}](${site}/work/${s.slug}): ${s.summary}`),
    "",
    "## Elsewhere",
    ...links,
    `- Email: ${profile.email}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
