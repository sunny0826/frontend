import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import {
  Loader2,
  Wallet,
  Plus,
  Trash2,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/app/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

type AccountType = 'domestic' | 'international';

interface WithdrawalAccount {
  id: number;
  account_type: AccountType;
  real_name: string;
  created_at: string;
  // domestic
  id_card?: string;
  phone?: string;
  bank_card?: string;
  // international
  currency?: string;
  swift_account?: string;
}

type DialogStep = 'select' | 'domestic' | 'international';

export default function WithdrawalAccountsPage() {
  const { t } = useTranslation();

  const domesticSchema = z.object({
    real_name: z.string().min(1, t('withdrawalAccounts.fieldRequired')),
    id_card: z.string().min(1, t('withdrawalAccounts.fieldRequired')),
    phone: z.string().min(1, t('withdrawalAccounts.fieldRequired')),
    bank_card: z
      .string()
      .min(1, t('withdrawalAccounts.fieldRequired'))
      .regex(/^\d+$/, t('withdrawalAccounts.bankCardDigitsOnly')),
  });

  const internationalSchema = z.object({
    real_name: z.string().min(1, t('withdrawalAccounts.fieldRequired')),
    currency: z.string().min(1, t('withdrawalAccounts.fieldRequired')),
    swift_account: z.string().min(1, t('withdrawalAccounts.fieldRequired')),
  });

  type DomesticFormValues = z.infer<typeof domesticSchema>;
  type InternationalFormValues = z.infer<typeof internationalSchema>;

  const [accounts, setAccounts] = useState<WithdrawalAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>('select');
  const [deleteTarget, setDeleteTarget] = useState<WithdrawalAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const domesticForm = useForm<DomesticFormValues>({
    resolver: zodResolver(domesticSchema),
    defaultValues: {
      real_name: '',
      id_card: '',
      phone: '',
      bank_card: '',
    },
  });

  const internationalForm = useForm<InternationalFormValues>({
    resolver: zodResolver(internationalSchema),
    defaultValues: {
      real_name: '',
      currency: 'USD',
      swift_account: '',
    },
  });

  const fetchAccounts = useCallback(async () => {
    try {
      const { data } = await api.get('/me/withdrawal-accounts');
      setAccounts(data.items ?? []);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('withdrawalAccounts.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  function openCreateDialog() {
    setStep('select');
    domesticForm.reset({
      real_name: '',
      id_card: '',
      phone: '',
      bank_card: '',
    });
    internationalForm.reset({
      real_name: '',
      currency: 'USD',
      swift_account: '',
    });
    setDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setStep('select');
    }
  }

  async function submitDomestic(values: DomesticFormValues) {
    setIsSubmitting(true);
    try {
      await api.post('/me/withdrawal-accounts', {
        account_type: 'domestic',
        ...values,
      });
      toast.success(t('withdrawalAccounts.addSuccess'));
      setDialogOpen(false);
      setStep('select');
      await fetchAccounts();
    } catch (error: unknown) {
      const apiError = getApiError(error);
      if (apiError.code === 'not_signed') {
        toast.error(t('withdrawalAccounts.notSignedError'));
      } else {
        toast.error(apiError.message || t('common.operationFailed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitInternational(values: InternationalFormValues) {
    setIsSubmitting(true);
    try {
      await api.post('/me/withdrawal-accounts', {
        account_type: 'international',
        ...values,
      });
      toast.success(t('withdrawalAccounts.addSuccess'));
      setDialogOpen(false);
      setStep('select');
      await fetchAccounts();
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('common.operationFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(account: WithdrawalAccount) {
    try {
      await api.delete(`/me/withdrawal-accounts/${account.id}`);
      toast.success(t('withdrawalAccounts.deleteSuccess'));
      setDeleteTarget(null);
      await fetchAccounts();
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(apiError.message || t('withdrawalAccounts.deleteFailed'));
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            <h1 className="text-2xl font-bold">{t('withdrawalAccounts.title')}</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {t('withdrawalAccounts.subtitle')}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          {t('withdrawalAccounts.addAccount')}
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Wallet className="mx-auto size-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{t('withdrawalAccounts.noAccounts')}</p>
            <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
              <Plus className="size-4" />
              {t('withdrawalAccounts.addAccount')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <Card key={account.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{account.real_name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {account.account_type === 'domestic'
                        ? t('withdrawalAccounts.typeDomestic')
                        : t('withdrawalAccounts.typeInternational')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                  {account.account_type === 'domestic' ? (
                    <>
                      <div>
                        <span className="text-foreground/70 mr-2">
                          {t('withdrawalAccounts.idCard')}:
                        </span>
                        {account.id_card}
                      </div>
                      <div>
                        <span className="text-foreground/70 mr-2">
                          {t('withdrawalAccounts.phone')}:
                        </span>
                        {account.phone}
                      </div>
                      <div>
                        <span className="text-foreground/70 mr-2">
                          {t('withdrawalAccounts.bankCard')}:
                        </span>
                        {account.bank_card}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-foreground/70 mr-2">
                          {t('withdrawalAccounts.currency')}:
                        </span>
                        {account.currency}
                      </div>
                      <div>
                        <span className="text-foreground/70 mr-2">
                          {t('withdrawalAccounts.swiftAccount')}:
                        </span>
                        {account.swift_account}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(account)}
                  >
                    <Trash2 className="size-3.5" />
                    {t('withdrawalAccounts.deleteAccount')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 添加账号 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 'select'
                ? t('withdrawalAccounts.selectType')
                : t('withdrawalAccounts.addAccount')}
            </DialogTitle>
          </DialogHeader>

          {step === 'select' && (
            <div className="grid grid-cols-2 gap-3 py-2">
              <button
                type="button"
                onClick={() => setStep('domestic')}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-6 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <span className="text-base">{t('withdrawalAccounts.typeDomestic')}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep('international')}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-6 text-sm font-medium hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <span className="text-base">{t('withdrawalAccounts.typeInternational')}</span>
              </button>
            </div>
          )}

          {step === 'domestic' && (
            <Form {...domesticForm}>
              <form
                onSubmit={domesticForm.handleSubmit(submitDomestic)}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  {t('withdrawalAccounts.domesticNotice')}
                </p>
                <div className="flex justify-center">
                  <img
                    src="/withdraw-qrcode.png"
                    alt="withdraw qrcode"
                    className="size-40 rounded-md border"
                  />
                </div>
                <FormField
                  control={domesticForm.control}
                  name="real_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('withdrawalAccounts.realName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={domesticForm.control}
                  name="id_card"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('withdrawalAccounts.idCard')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={domesticForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('withdrawalAccounts.phone')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={domesticForm.control}
                  name="bank_card"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('withdrawalAccounts.bankCard')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertDescription>
                    {t('withdrawalAccounts.infoConsistencyWarning')}
                  </AlertDescription>
                </Alert>
                <DialogFooter className="gap-2 sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep('select')}
                  >
                    <ArrowLeft className="size-4" />
                    {t('withdrawalAccounts.back')}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {t('withdrawalAccounts.submit')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}

          {step === 'international' && (
            <Form {...internationalForm}>
              <form
                onSubmit={internationalForm.handleSubmit(submitInternational)}
                className="space-y-4"
              >
                <p className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                  <span>{t('withdrawalAccounts.internationalNotice')}</span>
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {t('withdrawalAccounts.goSign')}
                  </a>
                </p>
                <FormField
                  control={internationalForm.control}
                  name="real_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('withdrawalAccounts.realName')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={internationalForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('withdrawalAccounts.currency')}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={internationalForm.control}
                  name="swift_account"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('withdrawalAccounts.swiftAccount')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Alert variant="destructive">
                  <AlertTriangle />
                  <AlertDescription>
                    {t('withdrawalAccounts.infoConsistencyWarning')}
                  </AlertDescription>
                </Alert>
                <DialogFooter className="gap-2 sm:justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep('select')}
                  >
                    <ArrowLeft className="size-4" />
                    {t('withdrawalAccounts.back')}
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {t('withdrawalAccounts.submit')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('withdrawalAccounts.deleteAccount')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('withdrawalAccounts.deleteConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
            >
              {t('withdrawalAccounts.deleteAccount')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
