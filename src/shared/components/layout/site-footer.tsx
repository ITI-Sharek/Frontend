import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Github,
  Mail,
  MessageCircleQuestion,
  ShieldCheck,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { ROUTES } from "@/config/routes.config";

const SUPPORT_EMAIL = "support@sharek.dev";
const GITHUB_REPOSITORY = "https://github.com/ITI-Sharek/Sharek";
const DOCUMENTATION_REPOSITORY = "https://github.com/ITI-Sharek/Documentation";

type FooterIcon = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

interface FooterLink {
  label: string;
  to?: string;
  href?: string;
}

const socialIconStyles = {
  github: "bg-[#24292f] text-white",
  documentation: "bg-[#1d7188] text-white",
  support: "bg-[#30348c] text-white",
  email: "bg-[#0f766e] text-white",
};

export function SiteFooter() {
  const { i18n, t } = useTranslation();
  const isRtl = !i18n.language.startsWith("en");
  const LinkArrow = isRtl ? ChevronLeft : ChevronRight;

  const aboutLinks: FooterLink[] = [
    { label: t("landing.headerJourney"), href: `${ROUTES.landing}#journey` },
    { label: t("landing.headerEvidence"), href: `${ROUTES.landing}#evidence` },
    { label: t("landing.headerForWhom"), href: `${ROUTES.landing}#for-who` },
  ];

  const quickLinks: FooterLink[] = [
    { label: t("navigation.explore"), to: ROUTES.explore },
    { label: t("pageTitles.projects"), to: ROUTES.publicProjects },
    { label: t("landing.headerLogin"), to: ROUTES.login },
    { label: t("landing.headerCreateAccount"), to: ROUTES.register },
  ];

  const contactLinks: FooterLink[] = [
    { label: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
    { label: "GitHub", href: GITHUB_REPOSITORY },
    { label: t("navigation.support"), to: ROUTES.support },
  ];

  const socialLinks = [
    {
      label: t("footer.social.github"),
      href: GITHUB_REPOSITORY,
      icon: Github,
      style: socialIconStyles.github,
    },
    {
      label: t("footer.social.documentation"),
      href: DOCUMENTATION_REPOSITORY,
      icon: BookOpen,
      style: socialIconStyles.documentation,
    },
    {
      label: t("footer.social.support"),
      to: ROUTES.support,
      icon: MessageCircleQuestion,
      style: socialIconStyles.support,
    },
    {
      label: t("footer.social.email"),
      href: `mailto:${SUPPORT_EMAIL}`,
      icon: Mail,
      style: socialIconStyles.email,
    },
  ];

  return (
    <footer className="site-footer" aria-labelledby="site-footer-title">
      <div className="site-footer__main">
        <div className="site-footer__body">
          <section className="site-footer__brand" aria-labelledby="site-footer-title">
            <div className="site-footer__brand-lockup">
              <img
                src="/logo-1.png"
                alt=""
                width={72}
                height={72}
                className="site-footer__logo"
              />
              <div className="site-footer__wordmark" id="site-footer-title">
                <span>{t("brand.title")}</span>
                <span dir="ltr">{t("brand.subtitle")}</span>
              </div>
            </div>

            <p className="site-footer__description">{t("footer.description")}</p>

            <nav className="site-footer__social" aria-label={t("footer.social.title")}>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                const content = (
                  <>
                    <Icon className="size-[18px]" aria-hidden />
                    <span className="sr-only">{social.label}</span>
                  </>
                );

                if (social.to) {
                  return (
                    <Link
                      key={social.label}
                      to={social.to}
                      aria-label={social.label}
                      className={`site-footer__social-link ${social.style}`}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                    aria-label={social.label}
                    className={`site-footer__social-link ${social.style}`}
                  >
                    {content}
                  </a>
                );
              })}
            </nav>

            <div className="site-footer__principles">
              <FooterSectionTitle>{t("footer.principlesTitle")}</FooterSectionTitle>
              <div className="site-footer__principle-list">
                <PrincipleBadge icon={ShieldCheck} label={t("footer.principles.evidence")} />
                <PrincipleBadge icon={MessageCircleQuestion} label={t("footer.principles.human")} />
                <PrincipleBadge icon={BookOpen} label={t("footer.principles.record")} />
              </div>
            </div>
          </section>

          <FooterColumn title={t("footer.aboutTitle")} links={aboutLinks} Arrow={LinkArrow} />
          <FooterColumn title={t("footer.quickLinksTitle")} links={quickLinks} Arrow={LinkArrow} />

          <section className="site-footer__column" aria-labelledby="footer-contact-title">
            <FooterSectionTitle id="footer-contact-title">
              {t("footer.contactTitle")}
            </FooterSectionTitle>
            <div className="site-footer__links">
              {contactLinks.map((link) => (
                <FooterLink key={link.label} link={link} Arrow={LinkArrow} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="site-footer__bar">
        <div className="site-footer__bar-inner">
          <p className="site-footer__copyright" dir="ltr">
            {t("footer.copyright", { year: 2026 })}
          </p>

          <div className="site-footer__bar-links">
            <a
              href={GITHUB_REPOSITORY}
              target="_blank"
              rel="noreferrer"
              className="site-footer__bar-badge"
            >
              <Github className="size-4" aria-hidden />
              <span>{t("footer.repository")}</span>
            </a>
            <a
              href={DOCUMENTATION_REPOSITORY}
              target="_blank"
              rel="noreferrer"
              className="site-footer__bar-badge"
            >
              <BookOpen className="size-4" aria-hidden />
              <span>{t("footer.documentation")}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  Arrow,
}: {
  title: string;
  links: FooterLink[];
  Arrow: FooterIcon;
}) {
  return (
    <section className="site-footer__column" aria-label={title}>
      <FooterSectionTitle>{title}</FooterSectionTitle>
      <div className="site-footer__links">
        {links.map((link) => (
          <FooterLink key={link.label} link={link} Arrow={Arrow} />
        ))}
      </div>
    </section>
  );
}

function FooterLink({ link, Arrow }: { link: FooterLink; Arrow: FooterIcon }) {
  const content = (
    <>
      <Arrow className="site-footer__link-arrow" aria-hidden />
      <span>{link.label}</span>
    </>
  );

  if (link.to) {
    return (
      <Link to={link.to} className="site-footer__link">
        {content}
      </Link>
    );
  }

  return (
    <a
      href={link.href}
      target={link.href?.startsWith("http") ? "_blank" : undefined}
      rel={link.href?.startsWith("http") ? "noreferrer" : undefined}
      className="site-footer__link"
    >
      {content}
    </a>
  );
}

function FooterSectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <div className="site-footer__title-wrap">
      <h2 id={id} className="site-footer__title">
        {children}
      </h2>
      <span className="site-footer__title-rule" aria-hidden>
        <i />
        <i />
        <i />
        <b />
      </span>
    </div>
  );
}

function PrincipleBadge({ icon: Icon, label }: { icon: FooterIcon; label: string }) {
  return (
    <span className="site-footer__principle">
      <Icon className="size-3.5" aria-hidden />
      <span>{label}</span>
    </span>
  );
}
