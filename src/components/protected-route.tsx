import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { buildLoginPath, currentRedirectTarget } from '@/lib/redirect';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    // 通过 URL 参数 ?redirect=<原路径> 透传，登录完成后回跳
    const target = currentRedirectTarget(location);
    return <Navigate to={buildLoginPath(target)} replace />;
  }

  return <>{children}</>;
}
