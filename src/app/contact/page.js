
import { generateContactMetadata } from "@/lib/seo";

export const metadata = generateContactMetadata("ar");

import ContactContent from "./ContactContent";
import { BreadcrumbSchema, LocalBusinessSchema } from "@/components/seo/StructuredData";

export default function Page() {
  const breadcrumbs = [
    { name: "الرئيسية", url: "https://www.khatwah.online" },
    { name: "تواصل معنا", url: "https://www.khatwah.online/contact" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <LocalBusinessSchema />
      <ContactContent />
    </>
  );
}
