import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";

import { ROUTES } from "@/config/routes.config";
import { Button } from "@/shared/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-card bg-brand-indigo px-8 py-14 text-center dark:bg-card dark:border dark:border-border"
        >
          {/* Interlocking-circles brand motif */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <span className="absolute -top-16 start-[12%] size-48 rounded-full border-[3px] border-white/10 dark:border-brand-indigo/20" />
            <span className="absolute -top-8 start-[20%] size-36 rounded-full border-[3px] border-primary/30" />
            <span className="absolute -bottom-20 end-[10%] size-56 rounded-full border-[3px] border-white/10 dark:border-brand-indigo/20" />
            <span className="absolute -bottom-10 end-[18%] size-40 rounded-full border-[3px] border-primary/30" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-xl flex-col items-center gap-5">
            <h2 className="text-3xl font-bold text-brand-indigo-foreground dark:text-foreground">
              جاهز تشارك؟
            </h2>
            <p className="text-sm leading-relaxed text-brand-indigo-foreground/75 dark:text-muted-foreground sm:text-base">
              أنشئ حسابك، اربط GitHub، ودع الذكاء الاصطناعي يفتح لك — أو
              لمشروعك — الباب الصحيح.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="sm" className="px-8">
                <Link to={ROUTES.register}>إنشاء حساب مجاني</Link>
              </Button>
              <Link
                to={ROUTES.login}
                className="text-sm text-brand-indigo-foreground/75 underline-offset-4 transition-colors hover:text-brand-indigo-foreground hover:underline dark:text-muted-foreground dark:hover:text-foreground"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
