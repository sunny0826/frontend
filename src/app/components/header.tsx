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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
              OpenTalent
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/profile"
                title={user?.username || 'User'}
                aria-label="个人中心"
                className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </Link>
            ) : (
              <Button variant="ghost" className="hidden md:inline-flex" asChild>
                <Link to="/login">{t("header.login")}</Link>
              </Button>
            )}
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