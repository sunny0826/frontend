import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  Users,
} from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";

export function EcosystemSection() {
  const { t } = useLanguage();
  const participants = [
    {
      icon: Users,
      title: t("ecosystem.developers.title"),
      description: t("ecosystem.developers.description"),
      benefits: [
        t("ecosystem.developers.benefit1"),
        t("ecosystem.developers.benefit2"),
        t("ecosystem.developers.benefit3"),
        t("ecosystem.developers.benefit4"),
      ],
      tone: "text-chart-2",
    },
    {
      icon: Building2,
      title: t("ecosystem.enterprises.title"),
      description: t("ecosystem.enterprises.description"),
      benefits: [
        t("ecosystem.enterprises.benefit1"),
        t("ecosystem.enterprises.benefit2"),
        t("ecosystem.enterprises.benefit3"),
        t("ecosystem.enterprises.benefit4"),
      ],
      tone: "text-primary",
    },
    {
      icon: Layers,
      title: t("ecosystem.communities.title"),
      description: t("ecosystem.communities.description"),
      benefits: [
        t("ecosystem.communities.benefit1"),
        t("ecosystem.communities.benefit2"),
        t("ecosystem.communities.benefit3"),
        t("ecosystem.communities.benefit4"),
      ],
      tone: "text-chart-4",
    },
  ];
  const flowSteps = [
    {
      title: t("ecosystem.flow.step1.title"),
      description: t("ecosystem.flow.step1.description"),
    },
    {
      title: t("ecosystem.flow.step2.title"),
      description: t("ecosystem.flow.step2.description"),
    },
    {
      title: t("ecosystem.flow.step3.title"),
      description: t("ecosystem.flow.step3.description"),
    },
  ];

  return (
    <section id="ecosystem" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-3xl">
          <div className="mb-6 inline-flex h-8 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3">
            <Layers className="size-4 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-sm font-medium text-primary">{t("ecosystem.badge")}</span>
          </div>
          <h2 className="mb-5 text-balance text-3xl font-semibold text-foreground md:text-4xl">
            {t("ecosystem.title")}
          </h2>
          <p className="max-w-xl text-pretty text-base leading-7 text-muted-foreground">
            {t("ecosystem.description")}
          </p>
        </div>

        <div className="relative">
          <div className="mb-10 flex flex-col items-start gap-4 rounded-lg border border-border bg-card/40 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">{t("ecosystem.flow.title")}</p>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                {flowSteps.map((step) => step.title).join(" / ")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {flowSteps.map((step, index) => (
                <div key={step.title} className="flex items-center gap-2">
                  <span className="inline-flex h-9 items-center rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground">
                    {step.title}
                  </span>
                  {index < flowSteps.length - 1 ? (
                    <ArrowRight className="hidden size-4 text-muted-foreground sm:block" strokeWidth={1.5} aria-hidden="true" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {participants.map((participant) => {
              const Icon = participant.icon;

              return (
                <article
                  key={participant.title}
                  className="relative rounded-lg border border-border bg-card/35 p-5"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                        <Icon className={`size-5 ${participant.tone}`} strokeWidth={1.5} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold tracking-tight text-foreground">
                          {participant.title}
                        </h3>
                        <p className="mt-2 text-pretty text-sm leading-6 text-muted-foreground">
                          {participant.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <ul className="flex flex-wrap gap-2">
                    {participant.benefits.map((benefit) => (
                      <li key={benefit} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-background/75 px-3 text-sm text-muted-foreground">
                        <CheckCircle2
                          className={`size-4 shrink-0 ${participant.tone}`}
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
