import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Github, Loader2 } from 'lucide-react';
import { readRedirectFromParams, stashSocialRedirect } from '@/lib/redirect';
import { Button } from '@/app/components/ui/button';
import { AgreementCheckbox } from '@/components/agreement-checkbox';

// 登录页支持的三方登录提供商：仅保留 GitHub 与 AtomGit。
// 其它后端配置仍然保留（用于已绑定历史账号），但登录入口仅展示这两个。
// 增减项需同步：
//   1) backend/accounts/api_v1.py:SOCIAL_PROVIDERS
//   2) backend/config/settings.py 中对应平台的 KEY/SECRET 环境变量
//   3) 下方 getProviderDisplayName / getProviderIcon / getProviderLabel / getProviderClassName
const ENABLED_SOCIAL_PROVIDERS = ['github', 'atomgit'] as const;
type EnabledSocialProvider = (typeof ENABLED_SOCIAL_PROVIDERS)[number];

function AtomGitIcon({ className }: { className?: string }) {
  return (
    <img
      src="https://oss.open-digger.cn/logos/atomgit.png"
      alt=""
      aria-hidden="true"
      className={className}
      loading="lazy"
    />
  );
}

export default function LoginPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [agreed, setAgreed] = useState(false);
  const [socialLoading, setSocialLoading] = useState<EnabledSocialProvider | null>(null);

  // 从 URL 参数读取登录后跳转目标；未提供或不合法时默认 /insight
  const redirectTarget = readRedirectFromParams(searchParams) ?? '/insight';

  // 当用户从三方平台返回(浏览器后退或 bfcache 恢复)时重置 loading 状态,避免遮罩卡死
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setSocialLoading(null);
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  function handleSocialLogin(provider: EnabledSocialProvider) {
    if (!agreed) {
      toast.error(t('auth.agreementRequired'));
      return;
    }
    if (socialLoading) return;
    // 立即标记加载状态,展示全屏遮罩,阻止重复点击
    setSocialLoading(provider);
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const redirectUri = `${window.location.origin}/social-callback`;
    // 社交登录会经历 OAuth 整页跳转,以及后端重定向。
    // 自定义查询参数无法随路保留,这里先把 redirect 目标存入 sessionStorage,
    // 等回到 /social-callback 后再取出。
    stashSocialRedirect(redirectTarget);
    // 直接跳转后端社交登录入口；后端会重定向到 OAuth 授权页
    // 完成后再跳回前端 /social-callback 用 exchange_code 兑换 JWT
    window.location.href = `${baseUrl}/auth/social/${provider}/start?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  function getProviderDisplayName(providerId: EnabledSocialProvider) {
    return providerId === 'github' ? 'GitHub' : 'AtomGit';
  }

  function getProviderIcon(providerId: EnabledSocialProvider) {
    if (providerId === 'github') return <Github className="size-4" />;
    return <AtomGitIcon className="size-4" />;
  }

  function getProviderLabel(providerId: EnabledSocialProvider) {
    return providerId === 'github'
      ? t('auth.signInWithGitHub')
      : t('auth.signInWithAtomGit');
  }

  function getProviderClassName(providerId: EnabledSocialProvider) {
    if (providerId === 'github') {
      return 'w-full border-transparent bg-[#24292f] text-white hover:bg-[#1a1f24] hover:text-white';
    }
    return 'w-full border-transparent bg-[#1f6feb] text-white hover:bg-[#185fcb] hover:text-white';
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
        <p className="text-sm text-muted-foreground">{t('auth.loginSubtitle')}</p>
      </div>

      <AgreementCheckbox checked={agreed} onCheckedChange={setAgreed} />

      <div className="grid gap-2">
        {ENABLED_SOCIAL_PROVIDERS.map((id) => {
          const isCurrentLoading = socialLoading === id;
          return (
            <Button
              key={id}
              type="button"
              variant="outline"
              className={getProviderClassName(id)}
              onClick={() => handleSocialLogin(id)}
              disabled={socialLoading !== null}
            >
              {isCurrentLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                getProviderIcon(id)
              )}
              {getProviderLabel(id)}
            </Button>
          );
        })}
      </div>

      {socialLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t('auth.connectingProvider', { provider: getProviderDisplayName(socialLoading) })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
