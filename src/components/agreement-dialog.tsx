import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';

interface AgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agreementType: 'register' | 'point-redemption';
}

export function AgreementDialog({
  open,
  onOpenChange,
  agreementType,
}: AgreementDialogProps) {
  const { t, i18n } = useTranslation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const lang = i18n.language.startsWith('zh') ? 'zh' : 'en';
    const filePath = `/${agreementType}-agreement-${lang}.md`;

    setLoading(true);
    fetch(filePath)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
      })
      .catch(() => {
        setContent('');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, agreementType, i18n.language]);

  const title =
    agreementType === 'register'
      ? t('auth.registerAgreement')
      : t('auth.pointRedemptionAgreement');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl sm:max-w-5xl">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <ScrollArea className="h-[80vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : (
            <div className="max-w-none pr-4 pt-6 leading-7 text-foreground [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_code]:rounded [&_code]:bg-background [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_em]:italic [&_h1]:mb-4 [&_h1]:mt-2 [&_h1]:text-2xl [&_h1]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h4]:mb-2 [&_h4]:mt-4 [&_h4]:text-base [&_h4]:font-semibold [&_hr]:my-6 [&_hr]:border-border [&_li>ol]:my-1 [&_li>ul]:my-1 [&_li]:my-1 [&_li]:leading-7 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-3 [&_p]:leading-7 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-background [&_pre]:p-4 [&_strong]:font-semibold [&_table]:my-4 [&_table]:w-full [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
