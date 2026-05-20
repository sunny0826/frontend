import { Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Logo } from "@/app/components/logo";
import { LanguageToggle } from "@/app/components/language-toggle";
import { useLanguage } from "@/app/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";

export function Header() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1E293B]/95 backdrop-blur-sm border-b border-[#475569]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-semibold">
              <span style={{ color: "#3B82F6" }}>Open</span>
              <span style={{ color: "#22C55E" }}>Share</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/profile"
                title={user?.username || 'User'}
                aria-label="个人中心"
                className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-[#22C55E]/10 text-[#22C55E] text-sm font-semibold hover:bg-[#22C55E]/20 transition-colors"
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Link>
            ) : (
              <Button variant="ghost" className="hidden md:inline-flex text-[#E2E8F0] hover:text-[#22C55E]" asChild>
                <Link to="/login">{t("header.login")}</Link>
              </Button>
            )}
            <LanguageToggle />
            <Button variant="ghost" size="icon" className="md:hidden text-[#E2E8F0]">
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}