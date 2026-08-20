import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Student Productivity Hub",
    short_name: "Study Hub",
    description: "A calm, open workspace for planning, focused study, quiz practice, and progress.",
    id: "/",
    start_url: "/",
    scope: "/",
    display_override: ["window-controls-overlay", "standalone"],
    display: "standalone",
    orientation: "any",
    background_color: "#f7f3ec",
    theme_color: "#174c4f",
    lang: "en-US",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
