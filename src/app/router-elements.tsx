import { Suspense, useEffect, type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { initLocalhostGeoOverride, hasLocalhostOverride } from '@/lib/geo';
import { RouteErrorBoundary, useGlobalUnhandledErrorHandler } from '@/components/error-boundary';

// Root layout with AuthProvider
export function RootLayout() {
  // 初始化 localhost 开发覆盖（仅首次渲染时检测 URL 参数）
  initLocalhostGeoOverride();
  // 全局未捕获异常 / 动态 import 失败兜底（toast 引导刷新）
  useGlobalUnhandledErrorHandler();

  return (
    <AuthProvider>
      <GeoParamSync />
      {/*
        顶层错误边界：兜住非懒加载页面（/、/login）以及 AuthProvider/ProtectedRoute
        等公共节点抛出的渲染期异常，避免整站白屏。
      */}
      <RouteErrorBoundary>
        <Outlet />
      </RouteErrorBoundary>
    </AuthProvider>
  );
}

/**
 * 开发环境专用：在 localhost 上当 is_mainland_cn 覆盖生效时，
 * 每次路由变化自动将 ?is_mainland_cn=1 追加到 URL，防止导航后参数丢失。
 * 生产环境不渲染任何内容。
 */
export function GeoParamSync() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasLocalhostOverride()) return;
    const params = new URLSearchParams(location.search);
    if (params.get('is_mainland_cn') === '1') return; // 已存在，无需操作
    params.set('is_mainland_cn', '1');
    navigate(`${location.pathname}?${params.toString()}${location.hash}`, { replace: true });
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}

export function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

export function LazyElement({ children }: { children: ReactNode }) {
  return (
    <RouteErrorBoundary>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </RouteErrorBoundary>
  );
}
