import { Languages, Moon, Settings, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Switch } from '@/app/components/ui/switch';
import { cn } from '@/app/components/ui/utils';

type LanguageOption = 'zh' | 'en';

export default function SettingsGeneralPage() {
  const { t, i18n } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const currentLanguage = (i18n.language || 'zh').startsWith('en') ? 'en' : 'zh';
  const isDark = resolvedTheme !== 'light';

  const languageOptions: Array<{ value: LanguageOption; label: string }> = [
    { value: 'zh', label: t('settings.zh') },
    { value: 'en', label: t('settings.en') },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 space-y-1">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-balance">
          <Settings className="size-5 text-primary" aria-hidden="true" />
          {t('settings.general')}
        </h1>
        <p className="text-sm text-muted-foreground text-pretty">
          {t('settings.generalDesc')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences')}</CardTitle>
          <CardDescription>{t('settings.preferencesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          <section className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex min-w-0 gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                <Languages className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1">
                <h2 className="text-base font-semibold">{t('settings.language')}</h2>
                <p className="text-sm text-muted-foreground text-pretty">{t('settings.languageDesc')}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:w-56">
              {languageOptions.map((option) => {
                const active = option.value === currentLanguage;
                return (
                  <Button
                    key={option.value}
                    type="button"
                    variant={active ? 'default' : 'outline'}
                    className={cn('min-h-11', !active && 'bg-transparent')}
                    aria-pressed={active}
                    onClick={() => void i18n.changeLanguage(option.value)}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex min-w-0 gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
                {isDark ? (
                  <Moon className="size-5" aria-hidden="true" />
                ) : (
                  <Sun className="size-5" aria-hidden="true" />
                )}
              </span>
              <div className="min-w-0 space-y-1">
                <h2 className="text-base font-semibold">{t('settings.theme')}</h2>
                <p className="text-sm text-muted-foreground text-pretty">
                  {isDark ? t('settings.darkModeDesc') : t('settings.lightModeDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-secondary/40 px-4 py-3 sm:min-w-56">
              <span className="text-sm font-medium">
                {isDark ? t('settings.darkMode') : t('settings.lightMode')}
              </span>
              <Switch
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label={t('settings.theme')}
              />
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
