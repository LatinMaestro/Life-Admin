import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Family Life Admin",
    short_name: "Life Admin",
    description: "Private household tasks, reminders, shopping, bills, renewals, and family admin.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#faf9f4",
    theme_color: "#28745f",
    orientation: "portrait-primary",
    categories: ["productivity", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
