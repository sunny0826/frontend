import { Sparkles } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";

export function CTASection() {
  const { t } = useLanguage();
  const partners = [
    "清华大学",
    "北京大学",
    "阿里云",
    "腾讯开源",
    "华为云",
    "字节跳动",
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDQyYzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20" />

      <div className="max-w-4xl mx-auto relative z-10 text-center text-white">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-8">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">{t("cta.badge")}</span>
        </div>

        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          {t("cta.title.line1")}
          <br />
          {t("cta.title.line2")}
        </h2>

        <p className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          {t("cta.description")}
        </p>

        <div className="mt-16 pt-12 border-t border-white/20">
          <p className="text-sm text-white/70 mb-4">{t("cta.partners")}</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            {partners.map((org) => (
              <div key={org} className="text-white font-medium">
                {org}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}