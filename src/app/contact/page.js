
export const metadata = {
  title: "تواصل معنا — خُطوة اونلاين",
  description:
    "تواصل مع خُطوة اونلاين — واتساب، بريد إلكتروني، أو من خلال نموذج الاتصال. بنرد في أقل من ٢٤ ساعة.",
  alternates: {
    canonical: "https://khatwah.vercel.app/contact",
  },
  openGraph: {
    title: "تواصل معنا — خُطوة اونلاين",
    description: "سواء مشروع، فكرة، أو مجرد سؤال — إحنا هنا.",
    url: "https://khatwah.vercel.app/contact",
    type: "website",
  },
};

import ContactContent from "./ContactContent";

export default function Page() {
  return <ContactContent />;
}
