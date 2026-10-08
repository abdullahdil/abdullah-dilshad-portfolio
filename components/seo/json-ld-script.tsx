import { serializeJsonLd } from "@/lib/seo/json-ld";

/** Renders schema.org data; escaping lives in serializeJsonLd. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
