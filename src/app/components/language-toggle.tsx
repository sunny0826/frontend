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
        className="size-8 rounded-md border border-[#475569] bg-transparent text-[#E2E8F0] hover:bg-[#22C55E]/10 hover:text-[#22C55E] hover:border-[#22C55E]/40"
        title={ariaLabel}
        aria-label={ariaLabel}
      >
        <Languages className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={toggleLanguage}
      className="gap-2 border border-[#475569] bg-transparent text-[#E2E8F0] hover:bg-[#22C55E]/10 hover:text-[#22C55E] hover:border-[#22C55E]/40"
      aria-label={ariaLabel}
    >
      <Languages className="w-4 h-4" />
      <span>{nextLabel}</span>
    </Button>
  );
}
