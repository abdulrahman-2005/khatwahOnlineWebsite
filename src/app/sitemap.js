export default function sitemap() {
  const baseUrl = "https://khatwah.vercel.app/";

  // Static pages
  const pages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Project detail pages (use dynamic import for ESM)
  const projectPages = [
    { url: `${baseUrl}/projects/booking-app`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/projects/inventory-pos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/projects/arish-catalogue`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  return [...pages, ...projectPages];
}
