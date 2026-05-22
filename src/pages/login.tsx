import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import axios from 'axios';
import { Github, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import api, { getApiError } from '@/lib/api';
import { resolveApiErrorMessage } from '@/lib/auth-errors';
import { readRedirectFromParams, stashSocialRedirect } from '@/lib/redirect';
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
import { Separator } from '@/app/components/ui/separator';
import { AgreementCheckbox } from '@/components/agreement-checkbox';

// 仅展示 GitHub 与 Gitee；顺序与数组一致
const ENABLED_SOCIAL_PROVIDERS = ['github', 'gitee'] as const;
type EnabledSocialProvider = (typeof ENABLED_SOCIAL_PROVIDERS)[number];

type SocialProvider = {
  provider: string;
  name: string;
  icon: string;
  start_url: string;
};

function isEnabledProvider(p: string): p is EnabledSocialProvider {
  return (ENABLED_SOCIAL_PROVIDERS as readonly string[]).includes(p);
}

function GiteeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1024 1024"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M512 1024C229.222 1024 0 794.778 0 512S229.222 0 512 0s512 229.222 512 512-229.222 512-512 512z m259.149-568.883h-290.74a25.293 25.293 0 0 0-25.292 25.293l-0.026 63.206c0 13.952 11.315 25.293 25.267 25.293h177.024c13.978 0 25.293 11.315 25.293 25.267v12.646a75.853 75.853 0 0 1-75.853 75.853h-240.23a25.293 25.293 0 0 1-25.267-25.293V417.203a75.853 75.853 0 0 1 75.827-75.853h353.946a25.293 25.293 0 0 0 25.267-25.292l0.077-63.207a25.293 25.293 0 0 0-25.268-25.293H417.152a189.62 189.62 0 0 0-189.62 189.645V771.15c0 13.977 11.316 25.293 25.294 25.293h372.94a170.65 170.65 0 0 0 170.65-170.65V480.384a25.293 25.293 0 0 0-25.293-25.267z" />
    </svg>
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<SocialProvider[]>([]);
  const [agreed, setAgreed] = useState(false);

  // 从 URL 参数读取登录后跳转目标；未提供或不合法时默认 /insight
  const redirectTarget = readRedirectFromParams(searchParams) ?? '/insight';

  const loginSchema = z.object({
    account: z.string().min(1, t('auth.enterAccount')),
    password: z.string().min(6, t('auth.passwordMin6')),
  });

  type LoginFormValues = z.infer<typeof loginSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { account: '', password: '' },
  });

  useEffect(() => {
    api.get<{ providers: SocialProvider[] }>('/auth/social/providers')
      .then(({ data }) => {
        const list = (data?.providers ?? [])
          .filter((p) => isEnabledProvider(p.provider))
          .sort(
            (a, b) =>
              ENABLED_SOCIAL_PROVIDERS.indexOf(a.provider as EnabledSocialProvider) -
              ENABLED_SOCIAL_PROVIDERS.indexOf(b.provider as EnabledSocialProvider),
          );
        setProviders(list);
      })
      .catch(() => {/* 忽略加载失败 */});
  }, []);

  async function onSubmit(values: LoginFormValues) {
    if (!agreed) {
      toast.error(t('auth.agreementRequired'));
      return;
    }
    setIsLoading(true);
    try {
      await login(values.account, values.password);
      toast.success(t('auth.loginSuccess'));
      navigate(redirectTarget, { replace: true });
    } catch (error: unknown) {
      // 优先处理特殊网络状态
      if (axios.isAxiosError(error) && !error.response) {
        toast.error(t('auth.networkError'));
      } else if (axios.isAxiosError(error) && error.response?.status === 429) {
        toast.error(t('auth.tooManyAttempts'));
      } else {
        // 根据后端 code 展示本地化文案
        const apiError = getApiError(error);
        toast.error(resolveApiErrorMessage(t, apiError, t('auth.loginFailed')));
      }
    } finally {
      setIsLoading(false);
    }
  }

  function handleSocialLogin(provider: string) {
    if (!agreed) {
      toast.error(t('auth.agreementRequired'));
      return;
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const redirectUri = `${window.location.origin}/social-callback`;
    // 社交登录会经历 OAuth 整页跳转，以及后端重定向。
    // 自定义查询参数无法随路保留，这里先把 redirect 目标存入 sessionStorage，
    // 等回到 /social-callback 后再取出。
    stashSocialRedirect(redirectTarget);
    // 直接跳转后端社交登录入口；后端会重定向到 OAuth 授权页
    // 完成后再跳回前端 /social-callback 用 exchange_code 兑换 JWT
    window.location.href = `${baseUrl}/auth/social/${provider}/start?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  function getProviderIcon(providerId: EnabledSocialProvider) {
    if (providerId === 'github') return <Github className="size-4" />;
    return <GiteeIcon className="size-4" />;
  }

  function getProviderLabel(providerId: EnabledSocialProvider) {
    return providerId === 'github'
      ? t('auth.signInWithGitHub')
      : t('auth.signInWithGitee');
  }

  function getProviderClassName(providerId: EnabledSocialProvider) {
    if (providerId === 'github') {
      return 'w-full border-transparent bg-[#24292f] text-white hover:bg-[#1a1f24] hover:text-white';
    }
    return 'w-full border-transparent bg-[#c71d23] text-white hover:bg-[#a91920] hover:text-white';
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="account"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('auth.account')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('auth.accountPlaceholder')} {...field} />
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
                  <Input type="password" placeholder={t('auth.passwordPlaceholder')} {...field} />
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
            {t('auth.login')}
          </Button>
        </form>
      </Form>

      <AgreementCheckbox checked={agreed} onCheckedChange={setAgreed} />

      <div className="flex items-center justify-between text-sm">
        <Link
          to={`/signup${redirectTarget !== '/insight' ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
          className="text-primary hover:underline"
        >
          {t('auth.register')}
        </Link>
        <Link to="/password-reset" className="text-primary hover:underline">
          {t('auth.forgotPassword')}
        </Link>
      </div>

      {providers.length > 0 && (
        <>
          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-card px-2 text-xs text-muted-foreground">
              {t('auth.orSocialLogin')}
            </span>
          </div>

          <div className="grid gap-2">
            {providers.map((provider) => {
              const id = provider.provider as EnabledSocialProvider;
              return (
                <Button
                  key={id}
                  type="button"
                  variant="outline"
                  className={getProviderClassName(id)}
                  onClick={() => handleSocialLogin(id)}
                >
                  {getProviderIcon(id)}
                  {getProviderLabel(id)}
                </Button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
