import { useTranslation } from 'react-i18next';

// Re-export Language type for backward compatibility
export type Language = 'zh' | 'en';

/**
 * Backward-compatible hook that wraps react-i18next's useTranslation.
 * Components previously using useLanguage() can still call t() with the same key format.
 * The language-context Provider is no longer needed — i18next is initialized globally.
 */
export function useLanguage() {
  const { i18n, t } = useTranslation();
  return {
    language: i18n.language as Language,
    setLanguage: (lang: Language) => i18n.changeLanguage(lang),
    t,
  };
}
