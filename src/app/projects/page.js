import projects from "../../../data/projects.json";
import { generateProjectsMetadata } from "@/lib/seo";

export const metadata = generateProjectsMetadata("ar");

import ProjectsContent from "./ProjectsContent";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export default function Page() {
  const breadcrumbs = [
    { name: "الرئيسية", url: "https://www.khatwah.online" },
    { name: "مشاريعنا", url: "https://www.khatwah.online/projects" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <ProjectsContent />
    </>
  );
}
