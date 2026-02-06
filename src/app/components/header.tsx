import { Menu } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Logo } from "@/app/components/logo";
import { LanguageToggle } from "@/app/components/language-toggle";
import { useLanguage } from "@/app/contexts/language-context";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              OpenTalent
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#insight" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {t("header.nav.insight")}
            </a>
            <a href="#products" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {t("header.nav.products")}
            </a>
            <a href="#reports" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {t("header.nav.reports")}
            </a>
            <a href="#ecosystem" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
              {t("header.nav.ecosystem")}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              {t("header.login")}
            </Button>
            <LanguageToggle />
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}