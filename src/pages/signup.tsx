import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { getApiError } from '@/lib/api';
import { applyFieldErrors, resolveApiErrorMessage } from '@/lib/auth-errors';
import { readRedirectFromParams } from '@/lib/redirect';
import { Button } from '@/app/components/ui/button';
import { AgreementCheckbox } from '@/components/agreement-checkbox';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/app/components/ui/form';

export default function SignupPage() {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // 与登录页一致：从 URL 读取注册后跳转目标
  const redirectTarget = readRedirectFromParams(searchParams) ?? '/insight';

  const signupSchema = z.object({
    username: z.string().min(3, t('auth.usernameMin3')).max(30, t('auth.usernameMax30')),
    email: z.string().min(1, t('auth.enterEmail')).email(t('auth.validEmail')),
    password: z.string().min(8, t('auth.passwordMin8')),
    password_confirm: z.string().min(1, t('auth.confirmPasswordRequired')),
  }).refine((data) => data.password === data.password_confirm, {
    message: t('auth.passwordMismatch'),
    path: ['password_confirm'],
  });

  type SignupFormValues = z.infer<typeof signupSchema>;

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', password_confirm: '' },
  });

  async function onSubmit(values: SignupFormValues) {
    if (!agreed) {
      toast.error(t('auth.agreementRequired'));
      return;
    }
    setIsLoading(true);
    try {
      await registerUser(values.username, values.email, values.password, values.password_confirm);
      navigate(redirectTarget, { replace: true });
    } catch (error: unknown) {
      const apiError = getApiError(error);
      // 后端返回的字段 -> 前端表单字段映射
      const applied = applyFieldErrors(
        apiError.detail,
        {
          username: 'username',
          email: 'email',
          password: 'password',
          password1: 'password',
          password2: 'password_confirm',
        } as const,
        form.setError,
        t,
      );
      if (!applied) {
        toast.error(resolveApiErrorMessage(t, apiError, t('auth.signupFailed')));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.signup')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.signupSubtitle')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.username')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.usernamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('auth.emailPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.password')}</FormLabel>
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
                <FormLabel>{t('auth.confirmPassword')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('auth.confirmPasswordPlaceholder')} {...field} />
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
            {t('auth.signupButton')}
          </Button>
        </form>
      </Form>

      <AgreementCheckbox checked={agreed} onCheckedChange={setAgreed} />

      <div className="text-center text-sm">
        <span className="text-muted-foreground">{t('auth.hasAccount')}</span>{' '}
        <Link
          to={`/login${redirectTarget !== '/insight' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
          className="text-primary hover:underline"
        >
          {t('auth.goLogin')}
        </Link>
      </div>
    </div>
  );
}
