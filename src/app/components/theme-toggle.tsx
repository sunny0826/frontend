import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/contexts/language-context";

export function ThemeToggle() {
  const { t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? t("theme.switchToLight") : t("theme.switchToDark");
  const Icon = isDark ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(nextTheme)}
      className="border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      title={label}
      aria-label={label}
    >
      <Icon className="size-4" strokeWidth={1.5} />
    </Button>
  );
}
