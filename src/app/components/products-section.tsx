import {
  Target,
  Award,
  BarChart3,
  Zap,
} from "lucide-react";
import { Card } from "@/app/components/ui/card";
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
      color: "blue",
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
      color: "indigo",
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
      color: "purple",
    },
  ];

  const colorMap = {
    blue: {
      bg: "bg-blue-500/20",
      icon: "text-blue-400",
      border: "border-blue-500/30",
      gradient: "from-blue-400 to-blue-500",
    },
    indigo: {
      bg: "bg-indigo-500/20",
      icon: "text-indigo-400",
      border: "border-indigo-500/30",
      gradient: "from-indigo-400 to-indigo-500",
    },
    purple: {
      bg: "bg-purple-500/20",
      icon: "text-purple-400",
      border: "border-purple-500/30",
      gradient: "from-purple-400 to-purple-500",
    },
  };

  return (
    <section id="products" className="py-24 px-6 bg-[#0F172A]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(34,197,94,0.15)] rounded-full mb-6">
            <Zap className="w-4 h-4 text-[#22C55E]" />
            <span className="text-sm text-[#22C55E] font-medium">{t("products.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#E2E8F0] mb-6">
            {t("products.title")}
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            {t("products.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {products.map((product) => {
            const Icon = product.icon;
            const colors = colorMap[product.color as keyof typeof colorMap];

            return (
              <Card
                key={product.name}
                className="dark-card dark-card-hover p-8 group"
              >
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>

                <h3 className="text-2xl font-bold text-[#E2E8F0] mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-[#64748B] mb-4">{product.subtitle}</p>
                <p className="text-[#94A3B8] mb-6 leading-relaxed">
                  {product.description}
                </p>

                <ul className="space-y-3">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-[#94A3B8]"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${colors.gradient}`} />
                      {feature}
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
