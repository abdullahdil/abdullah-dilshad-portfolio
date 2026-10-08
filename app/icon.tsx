import { ImageResponse } from "next/og";
import { Monogram } from "@/lib/seo/monogram";

const SIZES = { small: 32, large: 512 } as const;

/** /icon/small (favicon) and /icon/large (manifest, 512px). */
export function generateImageMetadata() {
  return Object.entries(SIZES).map(([id, px]) => ({
    id,
    contentType: "image/png",
    size: { width: px, height: px },
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const key = String(await id) as keyof typeof SIZES;
  const px = SIZES[key] ?? SIZES.small;
  return new ImageResponse(<Monogram size={px} rounded={px <= 64} />, {
    width: px,
    height: px,
  });
}
