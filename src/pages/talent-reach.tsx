import { useTranslation } from 'react-i18next';
import { Radar } from 'lucide-react';

export default function TalentReachPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <Radar className="h-16 w-16 text-muted-foreground/50" />
      <h1 className="text-2xl font-bold">{t('nav.talentReach')}</h1>
      <p className="text-muted-foreground">{t('common.comingSoon')}</p>
    </div>
  );
}
