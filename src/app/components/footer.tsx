import { Github, Mail } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";

export function Footer() {
  const { t } = useLanguage();
  const productLinks = [
    { label: t("footer.products.insight"), href: "/insight" },
    { label: t("footer.products.ads"), href: "/talent-reach" },
    { label: t("footer.products.credit"), href: "/points" },
  ];

  return (
    <footer className="bg-[#0F172A] text-[#94A3B8] pt-16 pb-8 px-6 border-t border-[#475569]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#22C55E] to-[#3B82F6] rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">
                <span style={{ color: "#3B82F6" }}>Open</span>
                <span style={{ color: "#22C55E" }}>Share</span>
              </span>
            </div>
            <p className="text-sm text-[#64748B] mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <a
                href="https://github.com/opensharehq"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#334155] transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@open-share.cn"
                className="w-9 h-9 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#334155] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-[#E2E8F0] font-semibold mb-4">{t("footer.products")}</h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#64748B] hover:text-[#22C55E] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[#E2E8F0] font-semibold mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:contact@open-share.cn"
                  className="text-sm text-[#64748B] hover:text-[#22C55E] transition-colors"
                >
                  {t("footer.company.contact")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#475569]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#64748B]">
              {t("footer.copyright")}
            </p>
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#64748B] hover:text-[#94A3B8] transition-colors"
            >
              浙ICP备2025189350号
            </a>
            <p className="text-sm text-[#64748B]">
              {t("footer.slogan")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
