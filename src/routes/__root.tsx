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
      { name: "theme-color", content: "#f6f7f4", media: "(prefers-color-scheme: light)" },
      { name: "theme-color", content: "#0e1513", media: "(prefers-color-scheme: dark)" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/logo-1.png" },
      { rel: "apple-touch-icon", href: "/logo-1.png" },
    ],
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
