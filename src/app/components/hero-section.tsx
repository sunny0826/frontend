import { Github, GitBranch, Users, TrendingUp } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";
import { SiteSearchBox } from "@/app/components/site-search-box";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A] via-[#1a2332] to-[#0F172A] -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-[#22C55E]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto">
          {/* Main heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-12 leading-tight">
            <span className="text-[#E2E8F0]">
              {t("hero.title.line1")}
            </span>
            <br />
            <span className="gradient-text-green">
              {t("hero.title.line2")}
            </span>
          </h1>

          {/* Search input */}
          <div className="flex justify-center mb-16 max-w-4xl mx-auto">
            <SiteSearchBox variant="landing" />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-4xl mx-auto">
            <div className="dark-card dark-card-hover rounded-2xl p-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Github className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#E2E8F0] mb-1">5+</div>
              <div className="text-sm text-[#94A3B8]">{t("hero.stats.platforms")}</div>
            </div>

            <div className="dark-card dark-card-hover rounded-2xl p-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#E2E8F0] mb-1">{t("hero.stats.developers.count")}</div>
              <div className="text-sm text-[#94A3B8]">{t("hero.stats.developers")}</div>
            </div>

            <div className="dark-card dark-card-hover rounded-2xl p-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#E2E8F0] mb-1">{t("hero.stats.projects.count")}</div>
              <div className="text-sm text-[#94A3B8]">{t("hero.stats.projects")}</div>
            </div>

            <div className="dark-card dark-card-hover rounded-2xl p-6">
              <div className="flex justify-center mb-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-[#E2E8F0] mb-1">{t("hero.stats.accuracy.count")}</div>
              <div className="text-sm text-[#94A3B8]">{t("hero.stats.accuracy")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}