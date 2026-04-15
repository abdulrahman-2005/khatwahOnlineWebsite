export const metadata = {
  title: "من نحن — الفريق اللي بيبنى خُطوة اونلاين",
  description:
    "تلاتة من العريش، درسنا كمبيوتر ساينس، وقررنا نبدأ. تعرف على فريق خُطوة اونلاين — المؤسسين، الرؤية، والتقنيات اللي بنستخدمها.",
  alternates: {
    canonical: "https://khatwah.vercel.app/about",
  },
  openGraph: {
    title: "من نحن — فريق خُطوة اونلاين",
    description: "تلاتة من العريش. درسنا كمبيوتر ساينس. قررنا نبدأ.",
    url: "https://khatwah.vercel.app/about",
    type: "website",
  },
};

import AboutContent from "./AboutContent";

export default function Page() {
  return <AboutContent />;
}
