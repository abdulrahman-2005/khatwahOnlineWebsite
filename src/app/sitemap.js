import projectsData from "../../data/projects.json";
import productsData from "../../data/products.json";
import servicesData from "../../data/services.json";
import { getPostSlugs } from "@/sanity/client";

export default async function sitemap() {
  const baseUrl = "https://www.khatwah.online";

  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: baseUrl + "/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: baseUrl + "/products",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: baseUrl + "/services",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: baseUrl + "/projects",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: baseUrl + "/blog",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: baseUrl + "/contact",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const productPages = productsData.ar.map((product) => ({
    url: baseUrl + "/products/" + product.slug,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const projectPages = projectsData.map((project) => ({
    url: baseUrl + "/projects/" + project.slug,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const servicePages = servicesData.en.map((service) => ({
    url: baseUrl + "/services/" + service.slug,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Fetch blog posts from Sanity
  let blogPages = [];
  try {
    const posts = await getPostSlugs();
    blogPages = posts.map((post) => ({
      url: baseUrl + "/blog/" + post.slug,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.warn('Failed to fetch blog posts for sitemap:', error);
  }

  return [...staticPages, ...productPages, ...projectPages, ...servicePages, ...blogPages];
}