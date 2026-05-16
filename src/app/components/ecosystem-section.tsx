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
      bg: "bg-blue-50",
      icon: "text-blue-600",
      check: "text-blue-600",
    },
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-600",
      check: "text-indigo-600",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      check: "text-purple-600",
    },
  };

  return (
    <section id="ecosystem" className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full mb-6">
            <Layers className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">{t("ecosystem.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("ecosystem.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                className="p-8 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {participant.title}
                </h3>
                <p className="text-gray-600 mb-6">{participant.description}</p>

                <ul className="space-y-3">
                  {participant.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`w-5 h-5 ${colors.check} flex-shrink-0 mt-0.5`}
                      />
                      <span className="text-sm text-gray-700">{benefit}</span>
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
