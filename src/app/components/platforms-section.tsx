import { useLanguage } from "@/app/contexts/language-context";

export function PlatformsSection() {
  const { t } = useLanguage();
  const platforms = [
    { name: "GitHub", logo: "github", url: "https://github.com" },
    { name: "GitLab", logo: "gitlab", url: "https://gitlab.com" },
    { name: "Gitee", logo: "gitee", url: "https://gitee.com" },
    { name: "AtomGit", logo: "atomgit", url: "https://atomgit.com" },
    { name: "HuggingFace", logo: "huggingface", url: "https://huggingface.co" },
  ];

  return (
    <section className="py-16 px-6 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-medium mb-4">
            {t("platforms.subtitle")}
          </p>
          <h3 className="text-2xl font-semibold text-gray-900">
            {t("platforms.title")}
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              title={t("platforms.visitWebsite", { name: platform.name })}
              className="group flex flex-col items-center justify-center gap-3 transition-transform duration-200 hover:scale-110"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={`https://oss.open-digger.cn/logos/${platform.logo}.png`}
                  alt={platform.name}
                  className="w-8 h-8 object-contain"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900">
                {platform.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
