import {
  Target,
  Award,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Activity,
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
      bg: "bg-blue-100",
      icon: "text-blue-600",
      border: "border-blue-200",
      gradient: "from-blue-600 to-blue-700",
    },
    indigo: {
      bg: "bg-indigo-100",
      icon: "text-indigo-600",
      border: "border-indigo-200",
      gradient: "from-indigo-600 to-indigo-700",
    },
    purple: {
      bg: "bg-purple-100",
      icon: "text-purple-600",
      border: "border-purple-200",
      gradient: "from-purple-600 to-purple-700",
    },
  };

  return (
    <section id="products" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full mb-6">
            <Zap className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-indigo-700 font-medium">{t("products.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("products.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                className="p-8 hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300 group"
              >
                <div
                  className={`w-14 h-14 ${colors.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className={`w-7 h-7 ${colors.icon}`} />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{product.subtitle}</p>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>

                <ul className="space-y-3">
                  {product.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-3 text-sm text-gray-700"
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

        {/* Value props */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{t("products.value1.title")}</h4>
              <p className="text-sm text-gray-600">
                {t("products.value1.description")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{t("products.value2.title")}</h4>
              <p className="text-sm text-gray-600">
                {t("products.value2.description")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">{t("products.value3.title")}</h4>
              <p className="text-sm text-gray-600">
                {t("products.value3.description")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
