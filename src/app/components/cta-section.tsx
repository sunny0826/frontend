import { Sparkles } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";

export function CTASection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6">
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mb-8 inline-flex h-8 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3">
          <Sparkles className="size-4 text-primary" strokeWidth={1.5} />
          <span className="text-sm font-medium text-primary">{t("cta.badge")}</span>
        </div>

        <h2 className="mb-6 text-balance text-3xl font-semibold leading-tight text-primary md:text-4xl lg:text-5xl">
          {t("cta.title.line1")}
          <br />
          {t("cta.title.line2")}
        </h2>

        <p className="mx-auto max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
          {t("cta.description")}
        </p>
      </div>
    </section>
  );
}
