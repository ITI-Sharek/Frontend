import { createFileRoute } from "@tanstack/react-router";

import { SiteFooter } from "@/shared/components/layout/site-footer";
import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  HomeHeader,
  HowItWorksSection,
  PlansSection,
  RolesSection,
  TasksMarqueeSection,
} from "@/modules/home";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <HomeHeader />
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <RolesSection />
        <TasksMarqueeSection />
        <PlansSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
