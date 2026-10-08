import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.seoDescription,
    start_url: "/",
    display: "browser",
    background_color: "#fbfbfa",
    theme_color: "#fbfbfa",
    icons: [
      { src: "/icon/small", sizes: "32x32", type: "image/png" },
      { src: "/icon/large", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
