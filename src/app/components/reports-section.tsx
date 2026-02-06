import { FileText, Award, TrendingUp, Globe, ArrowRight } from "lucide-react";
import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/contexts/language-context";

export function ReportsSection() {
  const { t } = useLanguage();
  const reports = [
    {
      icon: Globe,
      title: t("reports.global.title"),
      year: t("reports.global.year"),
      description: t("reports.global.description"),
      highlights: [
        t("reports.global.highlight1"),
        t("reports.global.highlight2"),
        t("reports.global.highlight3"),
      ],
      badge: t("reports.global.badge"),
    },
    {
      icon: Award,
      title: t("reports.china.title"),
      year: t("reports.china.year"),
      description: t("reports.china.description"),
      highlights: [
        t("reports.china.highlight1"),
        t("reports.china.highlight2"),
        t("reports.china.highlight3"),
      ],
      badge: t("reports.china.badge"),
    },
    {
      icon: TrendingUp,
      title: t("reports.talent.title"),
      year: t("reports.talent.year"),
      description: t("reports.talent.description"),
      highlights: [
        t("reports.talent.highlight1"),
        t("reports.talent.highlight2"),
        t("reports.talent.highlight3"),
      ],
      badge: t("reports.talent.badge"),
    },
  ];

  return (
    <section id="reports" className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6">
            <FileText className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-700 font-medium">{t("reports.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("reports.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("reports.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.title}
                className="p-8 hover:shadow-2xl transition-all duration-300 border-2 hover:border-indigo-200 relative overflow-hidden group"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium rounded-full">
                  {report.badge}
                </div>

                <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-indigo-600" />
                </div>

                <div className="mb-2 flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-gray-900">
                    {report.title}
                  </h3>
                  <span className="text-sm text-gray-500">{report.year}</span>
                </div>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {report.description}
                </p>

                <div className="space-y-2 mb-6">
                  {report.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      {highlight}
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-indigo-50 group-hover:text-indigo-700"
                >
                  {t("reports.button")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-12 text-white">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-indigo-100">{t("reports.stat1")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-indigo-100">{t("reports.stat2")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">20+</div>
              <div className="text-indigo-100">{t("reports.stat3")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100万+</div>
              <div className="text-indigo-100">{t("reports.stat4")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
