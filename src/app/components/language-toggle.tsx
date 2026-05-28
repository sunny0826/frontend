import { Languages } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/components/ui/utils";
import { useLanguage } from "@/app/contexts/language-context";

interface LanguageToggleProps {
  iconOnly?: boolean;
  className?: string;
}

export function LanguageToggle({ iconOnly = false, className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "zh" ? "en" : "zh");
  };

  const nextLabel = language === "zh" ? "EN" : "中文";
  const ariaLabel = language === "zh" ? "Switch to English" : "切换到中文";

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleLanguage}
        className={cn(
          "size-11 bg-transparent text-foreground hover:bg-primary/10 hover:text-primary",
          className,
        )}
        title={ariaLabel}
        aria-label={ariaLabel}
      >
        <Languages className="size-4" strokeWidth={1.5} aria-hidden="true" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className={cn(
        "gap-2 bg-transparent text-foreground hover:bg-primary/10 hover:text-primary",
        className,
      )}
      aria-label={ariaLabel}
    >
      <Languages className="size-4" strokeWidth={1.5} aria-hidden="true" />
      <span>{nextLabel}</span>
    </Button>
  );
}
