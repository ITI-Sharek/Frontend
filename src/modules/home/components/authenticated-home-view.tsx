import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  CircleCheck,
  Clock3,
  FolderKanban,
  Flag,
  Laptop,
  Mail,
  Megaphone,
  MessageCircle,
  MonitorCog,
  Package,
  Pause,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Timer,
  Truck,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";

export interface AuthenticatedHomeUser {
  email: string;
  firstName: string;
  lastName: string;
  username: string | null;
  role: "owner" | "contributor";
}

const CATEGORY_KEYS = [
  "design",
  "development",
  "marketing",
  "education",
  "motion",
  "ai",
  "photo",
  "audio",
  "writing",
  "data",
  "advertising",
] as const;

type CategoryKey = (typeof CATEGORY_KEYS)[number];

const STATUS_ITEMS: ReadonlyArray<{
  key:
    | "inProgress"
    | "waiting"
    | "delivered"
    | "deliveryRequested"
    | "completed"
    | "revision"
    | "rejected"
    | "reported";
  color: string;
  icon: LucideIcon;
}> = [
  { key: "inProgress", color: "bg-sky-500", icon: Timer },
  { key: "waiting", color: "bg-amber-400", icon: Clock3 },
  { key: "delivered", color: "bg-emerald-500", icon: Truck },
  { key: "deliveryRequested", color: "bg-emerald-500", icon: CheckCircle2 },
  { key: "completed", color: "bg-red-500", icon: CircleCheck },
  { key: "revision", color: "bg-violet-500", icon: RotateCcw },
  { key: "rejected", color: "bg-rose-500", icon: XCircle },
  { key: "reported", color: "bg-red-500", icon: Flag },
];

const SERVICE_TILES: ReadonlyArray<{ icon: LucideIcon; label: string }> = [
  { icon: MonitorCog, label: "service-1" },
  { icon: ShieldCheck, label: "service-2" },
  { icon: Laptop, label: "service-3" },
  { icon: Megaphone, label: "service-4" },
  { icon: Mail, label: "service-5" },
  { icon: MessageCircle, label: "service-6" },
  { icon: FolderKanban, label: "service-7" },
  { icon: BriefcaseBusiness, label: "service-8" },
];

export function AuthenticatedHomeView({
  currentUser,
}: {
  currentUser: AuthenticatedHomeUser;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const displayName =
    currentUser.username ||
    [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") ||
    currentUser.email;

  const actionHref =
    currentUser.role === "owner" ? ROUTES.newProject : ROUTES.explore;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchValue.trim();
    void navigate({
      to: ROUTES.explore,
      search: query === "" ? {} : { q: query },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <CategoryNavigation />

      <section
        aria-labelledby="authenticated-home-hero-title"
        className="relative isolate min-h-[190px] overflow-hidden rounded-2xl border border-black/10 bg-[#393936] text-white shadow-[0_8px_24px_-18px_rgba(15,23,42,0.8)]"
        dir="rtl"
      >
        <HeroBackdrop />

        <div className="relative z-10 flex min-h-[190px] flex-col items-center px-4 pb-8 pt-3 text-center sm:px-8">
          <span className="absolute start-4 top-3 font-mono text-[10px] font-medium tracking-wide text-white/45">
            1.00
          </span>

          <p className="text-xs font-semibold text-white/90">
            <span aria-hidden>👋</span>{" "}
            {t("home.marketplace.welcome", { name: displayName })}
          </p>
          <h1
            id="authenticated-home-hero-title"
            className="mt-2 max-w-2xl text-sm font-bold leading-7 text-white sm:text-base"
          >
            {t("home.marketplace.heroTitle")}
          </h1>

          <form
            role="search"
            onSubmit={handleSearch}
            className="mt-3 flex w-full max-w-[670px] items-stretch rounded-xl bg-white p-1 shadow-[0_3px_16px_rgba(0,0,0,0.24)]"
          >
            <label className="sr-only" htmlFor="authenticated-home-search">
              {t("home.marketplace.searchPlaceholder")}
            </label>
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="authenticated-home-search"
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={t("home.marketplace.searchPlaceholder")}
                className="min-h-9 w-full rounded-lg border-0 bg-white ps-3 pe-10 text-right text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#18a579]/25"
              />
            </div>
            <button
              type="submit"
              className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-lg bg-[#17a579] px-3 text-xs font-bold text-white transition-colors hover:bg-[#128866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17a579] focus-visible:ring-offset-2"
            >
              <span>{t("home.marketplace.searchAction")}</span>
              <Search className="size-3.5" aria-hidden />
            </button>
          </form>
        </div>

        <button
          type="button"
          aria-label={t("home.marketplace.pauseHero")}
          className="absolute bottom-3 left-3 z-10 flex size-8 items-center justify-center rounded-full border border-white/80 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Pause className="size-3.5 fill-current" aria-hidden />
        </button>
      </section>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_292px]" dir="ltr">
        <main className="flex min-w-0 flex-col gap-3" dir="rtl">
          <BalanceCard />
          <OrdersCard />
        </main>

        <aside className="flex min-w-0 flex-col gap-3" dir="rtl">
          <QuickStats />
          <ServicesCard actionHref={actionHref} />
        </aside>
      </div>
    </div>
  );
}

function CategoryNavigation() {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t("home.marketplace.browseMore")}
      className="-mx-4 overflow-x-auto border-b border-border bg-card px-4 scrollbar-thin sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      dir="rtl"
    >
      <div className="flex min-w-max items-center justify-between gap-5 py-2 text-[11px] font-bold text-foreground/80">
        {CATEGORY_KEYS.map((key: CategoryKey) => (
          <Link
            key={key}
            to={ROUTES.explore}
            className="shrink-0 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t(`home.marketplace.categories.${key}`)}
          </Link>
        ))}
        <Link
          to={ROUTES.explore}
          className="inline-flex shrink-0 items-center gap-1 text-primary transition-colors hover:text-primary/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          {t("home.marketplace.browseMore")}
        </Link>
      </div>
    </nav>
  );
}

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_18%,rgba(131,160,128,0.42),transparent_23%),radial-gradient(circle_at_54%_84%,rgba(152,112,84,0.42),transparent_28%),linear-gradient(108deg,#57514a_0%,#282a28_43%,#393933_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[28%] bg-[linear-gradient(90deg,rgba(13,15,14,0.32),transparent)]" />
      <div className="absolute -right-20 -top-24 size-80 rounded-full bg-emerald-100/10 blur-3xl" />
      <div className="absolute right-[14%] top-[-30%] h-[190%] w-16 rotate-[22deg] bg-black/10 blur-sm" />
      <div className="absolute bottom-[-54px] left-[11%] h-28 w-60 rounded-[50%] bg-black/25 blur-2xl" />
      <div className="absolute bottom-0 right-[25%] h-20 w-32 rounded-t-full border border-white/10 bg-white/[0.04]" />
      <div className="absolute bottom-0 right-[28%] h-24 w-px bg-white/10" />
      <div className="absolute bottom-0 right-[32%] h-16 w-px rotate-[18deg] bg-white/10" />
    </div>
  );
}

function BalanceCard() {
  const { t } = useTranslation();
  const metrics = [
    "pendingBalance",
    "availableBalance",
    "totalBalance",
  ] as const;

  return (
    <section
      aria-labelledby="home-balance-heading"
      className="rounded-2xl border border-border bg-card p-3 shadow-[0_2px_8px_-6px_rgba(15,23,42,0.3)] sm:p-4"
      data-card-hover
    >
      <h2 id="home-balance-heading" className="sr-only">
        {t("home.marketplace.totalBalance")}
      </h2>
      <div className="grid grid-cols-3 gap-2" dir="ltr">
        {metrics.map((metric) => (
          <div key={metric} className="text-center" dir="rtl">
            <div className="rounded-xl border border-border/70 bg-surface-fog px-2 py-2 text-[11px] font-bold text-foreground/75 sm:text-xs">
              {t(`home.marketplace.${metric}`)}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-foreground">
              <span className="font-mono text-base">0</span>
              <span className="text-lg font-bold text-[#168bb1]" aria-hidden>
                {t("home.marketplace.currency")}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link
        to={ROUTES.plan}
        className="mt-4 flex min-h-9 items-center justify-center rounded-xl border border-[#168bb1] px-3 text-xs font-bold text-[#168bb1] transition-colors hover:bg-[#168bb1]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168bb1] focus-visible:ring-offset-2"
      >
        <span>{t("home.marketplace.balanceDetails")}</span>
        <ArrowLeft className="ms-1 size-3.5" aria-hidden />
      </Link>
    </section>
  );
}

function OrdersCard() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="home-orders-heading"
      className="rounded-2xl border border-border bg-card p-3 shadow-[0_2px_8px_-6px_rgba(15,23,42,0.3)] sm:p-4"
      data-card-hover
    >
      <h2 id="home-orders-heading" className="sr-only">
        {t("home.marketplace.totalOrders")}
      </h2>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_190px]" dir="ltr">
        <div className="grid grid-cols-2 content-start gap-2" dir="rtl">
          {STATUS_ITEMS.map(({ key, color, icon: Icon }) => (
            <div
              key={key}
              className="flex min-h-10 items-center justify-between gap-2 rounded-xl border border-border/80 bg-card px-3 text-[11px] font-bold text-foreground/75 sm:text-xs"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={`size-1.5 shrink-0 rounded-full ${color}`} />
                <span className="truncate">
                  {t(`home.marketplace.orderStatuses.${key}`)}
                </span>
              </span>
              <span className="font-mono text-foreground">0</span>
              <Icon className="hidden size-3.5 shrink-0 text-muted-foreground/70 sm:block" aria-hidden />
            </div>
          ))}
        </div>

        <div className="flex min-h-[178px] flex-col items-center justify-center rounded-xl bg-surface-fog px-3 text-center" dir="rtl">
          <div className="flex size-14 items-center justify-center rounded-xl border border-border/70 bg-card text-[#b99365] shadow-sm">
            <Package className="size-8 fill-[#d4af7c]/60 stroke-[#b99365]" aria-hidden />
          </div>
          <p className="mt-2 text-sm font-extrabold text-foreground">
            {t("home.marketplace.totalOrders")}
          </p>
          <p className="mt-0.5 font-mono text-base font-bold text-foreground">0</p>
        </div>
      </div>

      <Link
        to={ROUTES.tasks}
        className="mt-4 flex min-h-9 items-center justify-center rounded-xl border border-border px-3 text-xs font-bold text-[#168bb1] transition-colors hover:border-[#168bb1] hover:bg-[#168bb1]/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#168bb1] focus-visible:ring-offset-2"
      >
        <span>{t("home.marketplace.showDetails")}</span>
        <ArrowLeft className="ms-1 size-3.5" aria-hidden />
      </Link>
    </section>
  );
}

function QuickStats() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-2" dir="ltr">
      <StatCard icon={BriefcaseBusiness} label={t("home.marketplace.portfolio")} />
      <StatCard icon={ShoppingBag} label={t("home.marketplace.services")} />
    </div>
  );
}

function StatCard({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div
      className="flex min-h-[78px] flex-col items-center justify-center rounded-2xl border border-border bg-card px-2 py-3 text-center shadow-[0_2px_8px_-6px_rgba(15,23,42,0.3)]"
      data-card-hover
      dir="rtl"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground/80">
        <Icon className="size-3.5 text-[#18a579]" aria-hidden />
        <span>{label}</span>
      </div>
      <span className="mt-1 font-mono text-base font-bold text-foreground">0</span>
    </div>
  );
}

function ServicesCard({ actionHref }: { actionHref: string }) {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="home-services-heading"
      className="relative flex min-h-[332px] flex-col overflow-hidden rounded-2xl border border-border bg-card px-3 pb-3 pt-2 shadow-[0_2px_8px_-6px_rgba(15,23,42,0.3)]"
      data-card-hover
    >
      <h2 id="home-services-heading" className="sr-only">
        {t("home.marketplace.services")}
      </h2>

      <div className="grid grid-cols-4 gap-2 opacity-60" aria-hidden>
        {SERVICE_TILES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex aspect-square items-center justify-center rounded-xl border border-border/70 bg-surface-fog text-[#67c4a6]"
          >
            <Icon className="size-7 stroke-[1.35]" />
          </div>
        ))}
      </div>

      <div className="relative flex flex-1 items-end justify-center pb-1 pt-0">
        <MarketplaceIllustration alt={t("home.marketplace.illustrationAlt")} />
      </div>

      <Link
        to={actionHref}
        className="relative z-10 mx-auto inline-flex min-h-9 items-center justify-center gap-1 rounded-xl bg-[#17a579] px-4 text-xs font-bold text-white shadow-[0_5px_14px_-7px_rgba(23,165,121,0.9)] transition-colors hover:bg-[#128866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#17a579] focus-visible:ring-offset-2"
      >
        <Sparkles className="size-3.5" aria-hidden />
        {t("home.marketplace.addService")}
      </Link>
    </section>
  );
}

function MarketplaceIllustration({ alt }: { alt: string }) {
  return (
    <svg
      role="img"
      aria-label={alt}
      viewBox="0 0 260 185"
      className="h-auto w-full max-w-[245px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{alt}</title>
      <g opacity="0.94">
        <path d="M31 53 47 42l15 8-16 12-15-9Z" fill="#CDEFE2" />
        <path d="m47 42 3 29-16-9-3-9 16-11Z" fill="#8BD4B6" />
        <path d="m47 42 14 8-1 21-13-8V42Z" fill="#5DBA91" />
        <path d="m48 49 8 4-8 5-8-5 8-4Z" fill="#F8FFFC" opacity="0.8" />
      </g>

      <g opacity="0.96">
        <path d="M190 37 208 25l18 9-18 13-18-10Z" fill="#D8F4E9" />
        <path d="m208 25 4 29-22-13V35l18-10Z" fill="#88D3B5" />
        <path d="m208 25 18 9-1 20-13-7-4-22Z" fill="#63BC95" />
        <path d="m210 34 9 5-9 5-9-5 9-5Z" fill="#F8FFFC" opacity="0.82" />
      </g>

      <circle cx="130" cy="28" r="12" fill="#D9F3E7" />
      <path d="M130 16v24M118 28h24" stroke="#2CA87A" strokeWidth="2" strokeLinecap="round" />
      <path d="m91 42 6-7 5 7-5 7-6-7Z" fill="#E9B94D" />
      <path d="m165 59 5-7 5 7-5 7-5-7Z" fill="#53BFA0" />
      <circle cx="67" cy="92" r="4" fill="#E7B94D" />
      <circle cx="199" cy="83" r="4" fill="#E7B94D" />

      <path d="M107 77 122 69l18 8-16 10-17-10Z" fill="#D5F2E5" />
      <path d="m122 69 2 26-17-10V77l15-8Z" fill="#86D2B5" />
      <path d="m122 69 18 8-1 19-15-8-2-19Z" fill="#55B68D" />
      <path d="m123 76 9 5-9 5-9-5 9-5Z" fill="#FCFFFE" opacity="0.8" />

      <g transform="translate(92 71)">
        <ellipse cx="39" cy="104" rx="38" ry="6" fill="#BEE7D3" opacity="0.65" />
        <path d="M27 35c0-8 6-14 14-14s14 6 14 14v10H27V35Z" fill="#C98C5A" />
        <path d="M26 32c3-7 9-10 15-10 7 0 12 3 15 10-4 4-9 6-15 6s-11-2-15-6Z" fill="#39342F" />
        <circle cx="41" cy="36" r="10" fill="#B9744A" />
        <path d="M37 38c1.5 1 6.5 1 8 0" stroke="#633C2D" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="37.5" cy="35" r="1.2" fill="#30231E" />
        <circle cx="45.5" cy="35" r="1.2" fill="#30231E" />
        <path d="M25 50c5-4 11-6 16-6s11 2 16 6l7 42c-8 7-17 10-23 10s-15-3-23-10l7-42Z" fill="#F8FCFA" />
        <path d="M33 47c2 4 5 6 8 6s6-2 8-6v47c-5 2-11 2-16 0V47Z" fill="#E8F5EF" />
        <path d="M25 53 11 70l7 7 16-14M57 53l14 17-7 7-16-14" stroke="#F8FCFA" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M35 98v8l-9 10h16l1-18M48 98v8l9 10H41l-1-18" fill="#3A9875" />
        <path d="M34 47c2 3 4 5 7 5s5-2 7-5" stroke="#3A9875" strokeWidth="2" />
        <path d="M12 70 4 62l4-5 11 8M71 70l8-8-4-5-11 8" fill="#B9744A" />
        <rect x="1" y="50" width="12" height="8" rx="2" transform="rotate(-16 1 50)" fill="#6DBFA0" />
        <rect x="71" y="47" width="13" height="9" rx="2" transform="rotate(14 71 47)" fill="#F0C354" />
      </g>

      <path d="M63 127c-4 3-7 7-9 13M206 118c4 4 6 8 7 14" stroke="#5EB995" strokeWidth="2" strokeLinecap="round" />
      <path d="m52 143 5-3 5 3-5 3-5-3ZM211 137l4-2 4 2-4 3-4-3Z" fill="#5EB995" />
    </svg>
  );
}
