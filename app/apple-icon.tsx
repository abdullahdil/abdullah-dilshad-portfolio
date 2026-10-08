import { ImageResponse } from "next/og";
import { Monogram } from "@/lib/seo/monogram";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** iOS applies its own corner mask, so the tile is square. */
export default function AppleIcon() {
  return new ImageResponse(<Monogram size={180} rounded={false} />, { ...size });
}
