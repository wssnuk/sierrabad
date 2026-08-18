import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SierraBad - ระบบบริหารจัดการก๊วนแบดมินตัน",
    short_name: "SierraBad",
    description: "แพลตฟอร์มบริหารจัดการก๊วนแบดมินตันครบวงจร",
    start_url: "/login",
    display: "standalone",
    background_color: "#FBF8FF",
    theme_color: "#7C3AED",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
