import { Github } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";

export function PlatformsSection() {
  const { t } = useLanguage();
  const platforms = [
    { name: "GitHub", logo: "github" },
    { name: "GitLab", logo: "gitlab" },
    { name: "Gitee", logo: "gitee" },
    { name: "AtomGit", logo: "atomgit" },
    { name: "HuggingFace", logo: "huggingface" },
    { name: "ModelScope", logo: "modelscope" },
    { name: "arXiv", logo: "arxiv" },
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

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 items-center">
          {platforms.map((platform) => (
            <div
              key={platform.name}
              className="flex flex-col items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Github className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {platform.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
