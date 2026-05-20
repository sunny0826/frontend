import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { resolveApiErrorMessage } from '@/lib/auth-errors';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form';

export default function PasswordResetPage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetSchema = z.object({
    email: z.string().min(1, t('auth.enterEmail')).email(t('auth.validEmail')),
  });

  type ResetFormValues = z.infer<typeof resetSchema>;

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: ResetFormValues) {
    setIsLoading(true);
    try {
      await api.post('/auth/password/reset/request', { email: values.email });
      setIsSuccess(true);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      toast.error(resolveApiErrorMessage(t, apiError, t('auth.sendFailed')));
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="size-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('auth.emailSent')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.emailSentDesc')}
          </p>
        </div>
        <Link to="/login" className="text-sm text-primary hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.passwordReset')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.passwordResetSubtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('auth.emailPlaceholder2')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t('auth.sendResetLink')}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <Link to="/login" className="text-primary hover:underline">
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  );
}
