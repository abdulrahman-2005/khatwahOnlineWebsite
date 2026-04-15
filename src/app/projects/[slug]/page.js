import projects from "../../../../data/projects.json";
import i18n from "../../../../data/i18n.json";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: i18n.ar.common.not_found };

  return {
    title: project.titleAr,
    description: project.descriptionAr,
    alternates: {
      canonical: `https://khatwah.vercel.app/projects/${slug}`,
    },
    openGraph: {
      title: `${project.titleAr} — خُطوة اونلاين`,
      description: project.descriptionAr,
      url: `https://khatwah.vercel.app/projects/${slug}`,
      type: "website",
    },
    keywords: [
      project.titleAr,
      project.titleEn,
      ...project.techStack,
      "خُطوة اونلاين",
      "مشروع تقني",
      "حلول رقمية",
    ].join(", "),
  };
}

import ProjectDetailContent from "./ProjectDetailContent";

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return <div className="flex min-h-screen items-center justify-center"><p style={{ color: "var(--color-text-muted)" }}>{i18n.ar.common.not_found}</p></div>;
  return <ProjectDetailContent project={project} />;
}
