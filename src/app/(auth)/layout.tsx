import { AuthHeader } from "@/shared/components/layout/auth-header";
import { SiteFooter } from "@/shared/components/layout/site-footer";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-start justify-between bg-background">
      <AuthHeader />
      <main className="flex w-full items-center justify-center px-4 py-12">
        <div className="flex w-full max-w-[480px] flex-col items-start gap-8">
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
