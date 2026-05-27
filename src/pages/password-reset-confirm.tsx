import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, CheckCircle2 } from 'lucide-react';
import api, { getApiError } from '@/lib/api';
import { applyFieldErrors, resolveApiErrorMessage } from '@/lib/auth-errors';
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

export default function PasswordResetConfirmPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const confirmSchema = z.object({
    password: z.string().min(8, t('auth.passwordMin8')),
    password_confirm: z.string().min(1, t('auth.confirmPasswordRequired')),
  }).refine((data) => data.password === data.password_confirm, {
    message: t('auth.passwordMismatch'),
    path: ['password_confirm'],
  });

  type ConfirmFormValues = z.infer<typeof confirmSchema>;

  const form = useForm<ConfirmFormValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { password: '', password_confirm: '' },
  });

  async function onSubmit(values: ConfirmFormValues) {
    if (!token) {
      toast.error(t('auth.invalidToken'));
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/password/reset/confirm', {
        token,
        password: values.password,
      });
      setIsSuccess(true);
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const applied = applyFieldErrors(
        apiError.detail,
        {
          new_password1: 'password',
          new_password2: 'password_confirm',
          password: 'password',
        } as const,
        form.setError,
        t,
      );
      if (!applied) {
        toast.error(resolveApiErrorMessage(t, apiError, t('auth.resetFailed')));
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('auth.invalidLink')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.invalidLinkDesc')}
          </p>
        </div>
        <Link to="/password-reset" className="text-sm text-primary hover:underline">
          {t('auth.resendResetLink')}
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="size-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{t('auth.passwordResetDone')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('auth.passwordResetDoneDesc')}
          </p>
        </div>
        <Link to="/login" className="text-sm text-primary hover:underline">
          {t('auth.goLogin2')}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.setNewPassword')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('auth.setNewPasswordSubtitle')}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.newPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('auth.passwordMin8')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password_confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.confirmNewPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('auth.confirmNewPasswordPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            {t('auth.resetPasswordButton')}
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
