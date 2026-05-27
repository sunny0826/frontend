import { Award, BarChart3, Target, Zap } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";

export function ProductsSection() {
  const { t } = useLanguage();
  const products = [
    {
      icon: BarChart3,
      name: t("products.insight.name"),
      subtitle: t("products.insight.subtitle"),
      description: t("products.insight.description"),
      features: [
        t("products.insight.feature1"),
        t("products.insight.feature2"),
        t("products.insight.feature3"),
        t("products.insight.feature4"),
      ],
      tone: "text-chart-2",
    },
    {
      icon: Target,
      name: t("products.ads.name"),
      subtitle: t("products.ads.subtitle"),
      description: t("products.ads.description"),
      features: [
        t("products.ads.feature1"),
        t("products.ads.feature2"),
        t("products.ads.feature3"),
        t("products.ads.feature4"),
      ],
      tone: "text-primary",
    },
    {
      icon: Award,
      name: t("products.credit.name"),
      subtitle: t("products.credit.subtitle"),
      description: t("products.credit.description"),
      features: [
        t("products.credit.feature1"),
        t("products.credit.feature2"),
        t("products.credit.feature3"),
        t("products.credit.feature4"),
      ],
      tone: "text-chart-4",
    },
  ];
  return (
    <section id="products" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <div className="mb-6 inline-flex h-8 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3">
            <Zap className="size-4 text-primary" strokeWidth={1.5} />
            <span className="text-sm font-medium text-primary">{t("products.badge")}</span>
          </div>
          <h2 className="mb-4 text-balance text-3xl font-semibold text-foreground md:text-4xl">
            {t("products.title")}
          </h2>
          <p className="max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
            {t("products.description")}
          </p>
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="absolute bottom-8 left-5 top-8 hidden w-px bg-border lg:block" aria-hidden="true" />

          <div className="space-y-10">
            {products.map((product) => {
              const Icon = product.icon;

              return (
                <article
                  key={product.name}
                  className="relative grid gap-5 border-t border-border pt-6 text-left first:border-t-0 first:pt-0 lg:grid-cols-[minmax(13rem,0.42fr)_minmax(0,1fr)] lg:border-t-0 lg:pl-16 lg:pt-0"
                >
                  <div className="absolute left-0 top-0 hidden size-10 items-center justify-center rounded-lg border border-border bg-background lg:flex">
                    <Icon className={`size-5 ${product.tone}`} strokeWidth={1.5} aria-hidden="true" />
                  </div>

                  <div className="min-w-0">
                    <div className="mb-4 flex size-10 items-center justify-center rounded-lg border border-border bg-background lg:hidden">
                      <Icon className={`size-5 ${product.tone}`} strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <p className={`mb-2 text-sm font-semibold ${product.tone}`}>
                      {product.subtitle}
                    </p>
                    <div className="min-w-0">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="max-w-3xl text-pretty text-base leading-7 text-muted-foreground">
                      {product.description}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {product.features.map((feature) => (
                        <li
                          key={feature}
                          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-card/35 px-3 text-sm text-muted-foreground"
                        >
                          <span className={`size-1.5 rounded-full bg-current ${product.tone}`} aria-hidden="true" />
                          <span className="min-w-0">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
