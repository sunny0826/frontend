import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { useLanguage } from "@/app/contexts/language-context";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
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
      className={cn(
        "size-11 border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary",
        className,
      )}
      title={label}
      aria-label={label}
    >
      <Icon className="size-4" strokeWidth={1.5} aria-hidden="true" />
    </Button>
  );
}
