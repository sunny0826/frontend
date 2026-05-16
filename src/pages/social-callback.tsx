import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import api, { getApiError } from '@/lib/api';
import { resolveApiErrorMessage, translateTopLevelCode } from '@/lib/auth-errors';
import { Button } from '@/app/components/ui/button';

export default function SocialCallbackPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setTokens } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const exchangeCode = useMemo(
    () => searchParams.get('exchange_code') ?? searchParams.get('code'),
    [searchParams],
  );
  const errorCode = searchParams.get('error');

  useEffect(() => {
    if (errorCode) {
      // 统一由 auth-errors 映射布署在回调 URL 的错误码
      setError(translateTopLevelCode(t, errorCode) ?? t('auth.socialLoginFailed'));
      return;
    }

    if (!exchangeCode) {
      setError(t('auth.socialMissingCode'));
      return;
    }

    async function exchange() {
      try {
        const { data } = await api.post('/auth/social/exchange', {
          exchange_code: exchangeCode,
        });
        await setTokens(data.access_token, data.refresh_token);
        navigate('/insight', { replace: true });
      } catch (err: unknown) {
        const apiError = getApiError(err);
        setError(resolveApiErrorMessage(t, apiError, t('auth.socialLoginFailed')));
      }
    }

    exchange();
  }, [errorCode, exchangeCode, navigate, setTokens, t]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex justify-center">
            <AlertCircle className="size-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{t('auth.loginFailedTitle')}</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/login">{t('auth.backToLogin')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="space-y-4 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('auth.completingLogin')}</p>
      </div>
    </div>
  );
}
