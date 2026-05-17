import { Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/app/contexts/language-context";

export function Footer() {
  const { t } = useLanguage();
  const footerLinks = {
    products: [
      t("footer.products.insight"),
      t("footer.products.ads"),
      t("footer.products.credit"),
      t("footer.products.pricing"),
    ],
    resources: [
      t("footer.resources.reports"),
      t("footer.resources.docs"),
      t("footer.resources.api"),
      t("footer.resources.cases"),
    ],
    company: [
      t("footer.company.about"),
      t("footer.company.careers"),
      t("footer.company.news"),
      t("footer.company.contact"),
    ],
    legal: [
      t("footer.legal.privacy"),
      t("footer.legal.terms"),
      t("footer.legal.security"),
      t("footer.legal.compliance"),
    ],
  };

  return (
    <footer className="bg-[#0F172A] text-[#94A3B8] pt-16 pb-8 px-6 border-t border-[#475569]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#22C55E] to-[#3B82F6] rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#E2E8F0]">
                OpenTalent
              </span>
            </div>
            <p className="text-sm text-[#64748B] mb-6">
              {t("footer.description")}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-9 h-9 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#334155] transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#334155] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#334155] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-[#1E293B] rounded-lg flex items-center justify-center hover:bg-[#334155] transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[#E2E8F0] font-semibold mb-4">{t("footer.products")}</h4>
            <ul className="space-y-3">
              {footerLinks.products.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[#64748B] hover:text-[#22C55E] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[#E2E8F0] font-semibold mb-4">{t("footer.resources")}</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[#64748B] hover:text-[#22C55E] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[#E2E8F0] font-semibold mb-4">{t("footer.company")}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[#64748B] hover:text-[#22C55E] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[#E2E8F0] font-semibold mb-4">{t("footer.legal")}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-[#64748B] hover:text-[#22C55E] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#475569]">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#64748B]">
              {t("footer.copyright")}
            </p>
            <p className="text-sm text-[#64748B]">
              {t("footer.slogan")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
