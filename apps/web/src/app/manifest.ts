import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "iLazım",
    short_name: "iLazım",
    description: "Hizmet ve ürün talepleriniz için teklif alın.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F3EF",
    theme_color: "#0C0C0C",
    lang: "tr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
