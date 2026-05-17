import {
  Building2,
  Users,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/app/components/ui/card";
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
      color: "blue",
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
      color: "indigo",
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
      color: "purple",
    },
  ];

  const colorMap = {
    blue: {
      bg: "bg-blue-500/20",
      icon: "text-blue-400",
      check: "text-[#22C55E]",
    },
    indigo: {
      bg: "bg-indigo-500/20",
      icon: "text-indigo-400",
      check: "text-[#22C55E]",
    },
    purple: {
      bg: "bg-purple-500/20",
      icon: "text-purple-400",
      check: "text-[#22C55E]",
    },
  };

  return (
    <section id="ecosystem" className="py-24 px-6 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(34,197,94,0.15)] rounded-full mb-6">
            <Layers className="w-4 h-4 text-[#22C55E]" />
            <span className="text-sm text-[#22C55E] font-medium">{t("ecosystem.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#E2E8F0] mb-6">
            {t("ecosystem.title")}
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            {t("ecosystem.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {participants.map((participant) => {
            const Icon = participant.icon;
            const colors =
              colorMap[participant.color as keyof typeof colorMap];

            return (
              <Card
                key={participant.title}
                className="dark-card dark-card-hover p-8"
              >
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>

                <h3 className="text-2xl font-bold text-[#E2E8F0] mb-2">
                  {participant.title}
                </h3>
                <p className="text-[#94A3B8] mb-6">{participant.description}</p>

                <ul className="space-y-3">
                  {participant.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 ${colors.check} flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-sm text-[#94A3B8]">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
