import { useState } from 'react';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { AgreementDialog } from './agreement-dialog';

interface AgreementCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  highlight?: boolean;
}

export function AgreementCheckbox({
  checked,
  onCheckedChange,
  highlight = false,
}: AgreementCheckboxProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'register' | 'point-redemption'>(
    'register'
  );

  const handleOpenAgreement = (type: 'register' | 'point-redemption') => {
    setDialogType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <div className={`flex items-center gap-2 rounded-md px-2 py-1 transition-colors duration-300 ${
        highlight ? 'animate-pulse bg-destructive/10 ring-1 ring-destructive/40' : ''
      }`}>
        <Checkbox
          checked={checked}
          onCheckedChange={(value) => onCheckedChange(value === true)}
        />
        <span className="text-sm text-muted-foreground">
          <span
            className="cursor-pointer select-none"
            onClick={() => onCheckedChange(!checked)}
          >
            {t('auth.agreePrefix')}
          </span>
          <span
            className="text-primary hover:underline cursor-pointer"
            onClick={() => handleOpenAgreement('register')}
          >
            {t('auth.registerAgreement')}
          </span>
          <span
            className="cursor-pointer select-none"
            onClick={() => onCheckedChange(!checked)}
          >
            {t('auth.agreementAnd')}
          </span>
          <span
            className="text-primary hover:underline cursor-pointer"
            onClick={() => handleOpenAgreement('point-redemption')}
          >
            {t('auth.pointRedemptionAgreement')}
          </span>
        </span>
      </div>

      <AgreementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agreementType={dialogType}
      />
    </>
  );
}
