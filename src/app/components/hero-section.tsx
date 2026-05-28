import { Github, GitBranch, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";
import { SiteSearchBox } from "@/app/components/site-search-box";

export function HeroSection() {
  const { t } = useLanguage();
  const proofItems = [
    { icon: Github, value: "5+", title: t("hero.stats.platforms"), description: t("hero.stats.platforms.description"), tone: "text-chart-2" },
    { icon: Users, value: t("hero.stats.developers.count"), title: t("hero.stats.developers"), description: t("hero.stats.developers.description"), tone: "text-primary" },
    { icon: GitBranch, value: t("hero.stats.projects.count"), title: t("hero.stats.projects"), description: t("hero.stats.projects.description"), tone: "text-chart-4" },
    { icon: TrendingUp, value: t("hero.stats.accuracy.count"), title: t("hero.stats.accuracy"), description: t("hero.stats.accuracy.description"), tone: "text-primary" },
  ];

  return (
    <section className="relative px-4 pb-14 pt-28 sm:px-6 lg:pb-16">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,0.46fr)] lg:items-center">
        <div className="max-w-4xl">
          <h1 className="mb-7 max-w-5xl text-balance text-5xl font-semibold leading-[1.04] text-foreground md:text-6xl lg:text-7xl">
            <span>{t("hero.title.line1")}</span>
            <br />
            <span className="font-bold text-primary">{t("hero.title.line2")}</span>
          </h1>

          <p className="mb-8 max-w-2xl text-pretty text-base leading-7 text-muted-foreground md:text-lg">
            {t("hero.description")}
          </p>

          <div className="relative z-50 mb-6 flex max-w-3xl justify-start">
            <SiteSearchBox variant="landing" />
          </div>
        </div>

        <aside className="bg-card/35 px-5 py-3" aria-label={t("hero.kicker")}>
          <div className="mb-2 flex items-center gap-2">
            <GitBranch className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <p className="text-sm font-semibold text-foreground">
              {t("hero.kicker")}
            </p>
          </div>

          <ul className="space-y-2">
            {proofItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.title} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 py-2">
                  <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-card/70">
                    <Icon className={`size-4 ${item.tone}`} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <h2 className="text-base font-semibold leading-6 text-foreground">{item.title}</h2>
                      <span className="shrink-0 font-mono text-sm font-semibold text-primary tabular-nums">
                        {item.value}
                      </span>
                    </div>
                    <p className="text-pretty text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    </section>
  );
}
