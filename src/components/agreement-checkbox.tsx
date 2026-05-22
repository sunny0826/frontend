import { useState } from 'react';
import { Checkbox } from '@/app/components/ui/checkbox';
import { useTranslation } from 'react-i18next';
import { AgreementDialog } from './agreement-dialog';

interface AgreementCheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function AgreementCheckbox({
  checked,
  onCheckedChange,
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
      <div className="flex items-center gap-2">
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
