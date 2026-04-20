import { generateAboutMetadata } from "@/lib/seo";

export const metadata = generateAboutMetadata("ar");

import AboutContent from "./AboutContent";
import { BreadcrumbSchema, LocalBusinessSchema } from "@/components/seo/StructuredData";

export default function Page() {
  const breadcrumbs = [
    { name: "الرئيسية", url: "https://www.khatwah.online" },
    { name: "من نحن", url: "https://www.khatwah.online/about" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <LocalBusinessSchema />
      <AboutContent />
    </>
  );
}
