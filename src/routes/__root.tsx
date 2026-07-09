import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";

import { AppProviders } from "@/providers/app-providers";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sharek" },
      {
        name: "description",
        content: "Sharek — community for developers and technical experts",
      },
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
