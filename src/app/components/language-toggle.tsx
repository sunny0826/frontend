import { Languages } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/contexts/language-context";

interface LanguageToggleProps {
  iconOnly?: boolean;
}

export function LanguageToggle({ iconOnly = false }: LanguageToggleProps) {
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
        className="size-8 border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        title={ariaLabel}
        aria-label={ariaLabel}
      >
        <Languages className="size-4" strokeWidth={1.5} />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className="gap-2 border border-border bg-transparent text-foreground hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
      aria-label={ariaLabel}
    >
      <Languages className="size-4" strokeWidth={1.5} />
      <span>{nextLabel}</span>
    </Button>
  );
}
