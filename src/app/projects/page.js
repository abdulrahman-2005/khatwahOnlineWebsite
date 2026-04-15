import projects from "../../../data/projects.json";

export const metadata = {
  title: "مشاريعنا — أعمال خُطوة اونلاين",
  description:
    "استعرض كل مشاريع خُطوة اونلاين — أنظمة حجوزات، إدارة مخزون، كتالوج العريش، والمزيد. كل مشروع من الفكرة للتنفيذ.",
  alternates: {
    canonical: "https://khatwah.vercel.app/projects",
  },
  openGraph: {
    title: "مشاريعنا — خُطوة اونلاين",
    description: "كل المشاريع اللي اشتغلنا عليها — من الفكرة للتنفيذ.",
    url: "https://khatwah.vercel.app/projects",
    type: "website",
  },
};

import ProjectsContent from "./ProjectsContent";

export default function Page() {
  return <ProjectsContent />;
}
