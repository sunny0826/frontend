import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
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

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const changePasswordSchema = z
    .object({
      current_password: z.string().min(1, t('auth.enterPassword')),
      new_password: z.string().min(8, t('auth.passwordMin8')),
      confirm_password: z.string().min(1, t('auth.confirmPasswordRequired')),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: t('auth.passwordMismatch'),
      path: ['confirm_password'],
    });

  type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsLoading(true);
    try {
      await api.post('/auth/password/change', {
        old_password: values.current_password,
        new_password1: values.new_password,
        new_password2: values.confirm_password,
      });
      toast.success(t('settings.passwordUpdated'));
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      const apiError = getApiError(error);
      // 将后端字段错误回填到表单
      const applied = applyFieldErrors(
        apiError.detail,
        {
          old_password: 'current_password',
          new_password1: 'new_password',
          new_password2: 'confirm_password',
        } as const,
        form.setError,
        t,
      );
      if (!applied) {
        toast.error(
          resolveApiErrorMessage(t, apiError, t('settings.changePasswordFailed')),
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
            <Lock className="size-5 text-primary" />
            <CardTitle>{t('settings.changePassword')}</CardTitle>
          </div>
          <CardDescription>
            {t('settings.changePasswordDesc')}
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
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.newPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('settings.newPasswordPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('settings.confirmNewPassword')}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={t('settings.confirmNewPasswordPlaceholder')}
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
