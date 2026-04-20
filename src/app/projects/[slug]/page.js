import projects from "../../../../data/projects.json";
import i18n from "../../../../data/i18n.json";
import { generateProjectMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: i18n.ar.common.not_found };

  return generateProjectMetadata(project, "ar");
}

import ProjectDetailContent from "./ProjectDetailContent";
import { BreadcrumbSchema, ProjectSchema } from "@/components/seo/StructuredData";

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return <div className="flex min-h-screen items-center justify-center"><p style={{ color: "var(--color-text-muted)" }}>{i18n.ar.common.not_found}</p></div>;
  
  const breadcrumbs = [
    { name: "الرئيسية", url: "https://www.khatwah.online" },
    { name: "مشاريعنا", url: "https://www.khatwah.online/projects" },
    { name: project.titleAr, url: `https://www.khatwah.online/projects/${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ProjectSchema project={project} />
      <ProjectDetailContent project={project} />
    </>
  );
}
