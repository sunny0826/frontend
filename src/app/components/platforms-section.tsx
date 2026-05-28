import { useLanguage } from "@/app/contexts/language-context";

export function PlatformsSection() {
  const { t } = useLanguage();
  const platforms = [
    { name: "GitHub", logo: "github", url: "https://github.com", signal: "code/repo" },
    { name: "GitLab", logo: "gitlab", url: "https://gitlab.com", signal: "merge/issue" },
    { name: "Gitee", logo: "gitee", url: "https://gitee.com", signal: "cn/ecosystem" },
    { name: "AtomGit", logo: "atomgit", url: "https://atomgit.com", signal: "project/hub" },
    { name: "HuggingFace", logo: "huggingface", url: "https://huggingface.co", signal: "model/dataset" },
  ];

  return (
    <section className="px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-2 text-center">
          <p className="font-mono text-xs font-semibold uppercase text-primary">
            {t("platforms.subtitle")}
          </p>
          <h3 className="text-balance text-xl font-semibold text-foreground sm:text-2xl">
            {t("platforms.title")}
          </h3>
          <p className="max-w-md text-pretty text-sm leading-6 text-muted-foreground">
            {t("platforms.description")}
          </p>
        </div>

        <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-10">
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              title={t("platforms.visitWebsite", { name: platform.name })}
              className="group flex w-20 flex-col items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-background p-2.5 transition-[border-color,background-color,box-shadow] duration-150 group-hover:border-primary/40 group-hover:bg-secondary/45 group-hover:shadow-sm">
                <img
                  src={`https://oss.open-digger.cn/logos/${platform.logo}.png`}
                  alt=""
                  className="size-8 object-contain"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              </span>
              <span className="w-full truncate text-center text-xs font-medium text-muted-foreground">
                {platform.name}
              </span>
            </a>
          ))}
          <div className="flex w-20 flex-col items-center gap-2" aria-hidden="true">
            <div className="flex size-14 items-center justify-center rounded-lg border border-border/60 bg-background/55">
              <span className="font-mono text-lg font-semibold text-muted-foreground">...</span>
            </div>
            <span className="w-full truncate text-center text-xs font-medium text-muted-foreground">
              {t("platforms.more")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
