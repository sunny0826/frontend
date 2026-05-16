import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import api, { getApiError } from '@/lib/api';
import { applyFieldErrors, resolveApiErrorMessage } from '@/lib/auth-errors';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form';

export default function ChangeEmailPage() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const changeEmailSchema = z.object({
    new_email: z.string().min(1, t('auth.enterEmail')).email(t('auth.validEmail')),
    current_password: z.string().min(1, t('auth.enterPassword')),
  });

  type ChangeEmailFormValues = z.infer<typeof changeEmailSchema>;

  const form = useForm<ChangeEmailFormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { new_email: '', current_password: '' },
  });

  async function onSubmit(values: ChangeEmailFormValues) {
    setIsLoading(true);
    try {
      await api.post('/auth/email/change', values);
      toast.success(t('settings.emailUpdated'));
      form.reset();
      await refreshUser();
    } catch (error: unknown) {
      const apiError = getApiError(error);
      const applied = applyFieldErrors(
        apiError.detail,
        {
          email: 'new_email',
          new_email: 'new_email',
          password: 'current_password',
          current_password: 'current_password',
        } as const,
        form.setError,
        t,
      );
      if (!applied) {
        toast.error(
          resolveApiErrorMessage(t, apiError, t('settings.changeEmailFailed')),
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            <CardTitle>{t('settings.changeEmail')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.currentEmail', { email: user?.email || t('settings.notSet') })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.currentPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('settings.currentPasswordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="new_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.newEmail')}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t('settings.newEmailPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
                {t('settings.confirmChange')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
