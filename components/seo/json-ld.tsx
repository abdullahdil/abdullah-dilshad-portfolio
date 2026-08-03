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
        email: profileSeed.email,
        url: siteUrl,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Islamabad",
          addressCountry: "PK",
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
