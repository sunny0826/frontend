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
    <section id="reports" className="py-24 px-6 bg-[#1E293B]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/15 rounded-full mb-6">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">{t("reports.badge")}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#E2E8F0] mb-6">
            {t("reports.title")}
          </h2>
          <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
            {t("reports.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {reports.map((report) => {
            const Icon = report.icon;
            return (
              <Card
                key={report.title}
                className="dark-card dark-card-hover p-8 relative overflow-hidden group"
              >
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-[#22C55E] to-[#3B82F6] text-[#0F172A] text-xs font-medium rounded-full">
                  {report.badge}
                </div>

                <div className="w-14 h-14 bg-[#22C55E]/15 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-[#22C55E]" />
                </div>

                <div className="mb-2 flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-[#E2E8F0]">
                    {report.title}
                  </h3>
                  <span className="text-sm text-[#64748B]">{report.year}</span>
                </div>

                <p className="text-[#94A3B8] mb-6 leading-relaxed">
                  {report.description}
                </p>

                <div className="space-y-2 mb-6">
                  {report.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="flex items-center gap-2 text-sm text-[#94A3B8]"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                      {highlight}
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-[#94A3B8] hover:bg-[#22C55E]/10 hover:text-[#22C55E]"
                >
                  {t("reports.button")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <div className="dark-card rounded-2xl p-12">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2 gradient-text-green">10+</div>
              <div className="text-[#94A3B8]">{t("reports.stat1")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 gradient-text-green">500+</div>
              <div className="text-[#94A3B8]">{t("reports.stat2")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 gradient-text-green">20+</div>
              <div className="text-[#94A3B8]">{t("reports.stat3")}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 gradient-text-green">100万+</div>
              <div className="text-[#94A3B8]">{t("reports.stat4")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
