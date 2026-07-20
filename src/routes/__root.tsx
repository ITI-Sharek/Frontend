import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { AppProviders } from "@/providers/app-providers";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sharek — مساهمات حقيقية، وسجل مهني قائم على الدليل" },
      {
        name: "description",
        content:
          "Sharek ينظم التعاون في المشاريع مفتوحة المصدر ويحفظ سجلاً مهنياً موثوقاً للمساهمات المكتملة والأدلة التي تدعمها.",
      },
      { name: "theme-color", content: "#ffffff" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <AppProviders>{children}</AppProviders>
        <Scripts />
      </body>
    </html>
  );
}
