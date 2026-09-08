import { profileSeed } from "@/lib/content/seed";
import { getSiteUrl } from "@/lib/site";

export function SiteJsonLd() {
  const siteUrl = getSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: profileSeed.fullName,
        description: profileSeed.heroDescription,
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: profileSeed.fullName,
        jobTitle: profileSeed.professionalTitle,
        description: profileSeed.shortBio,
        email: profileSeed.email,
        url: siteUrl,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Islamabad",
          addressCountry: "PK",
        },
        worksFor: {
          "@type": "Organization",
          name: "AiMark Labs",
        },
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: "FAST National University of Computer and Emerging Sciences (NUCES)",
        },
        knowsAbout: [
          "n8n",
          "Workflow automation",
          "AI automation",
          "LLM orchestration",
          "Retrieval-Augmented Generation",
          "REST API integration",
          "Lead generation automation",
          "Business process automation",
        ],
        hasCredential: {
          "@type": "EducationalOccupationalCredential",
          name: "n8n Level 2 Certified Developer",
          credentialCategory: "certification",
          url: profileSeed.credentialUrl,
        },
        sameAs: [
          profileSeed.linkedinUrl,
          profileSeed.n8nProfileUrl,
          profileSeed.credentialUrl,
        ].filter(Boolean),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
