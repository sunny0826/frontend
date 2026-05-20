/**
 * 登录后重定向工具：
 * - 通过 URL 查询参数 `?redirect=<path>` 在受保护路由 → /login → 登录后跳转链路中传递目标路径。
 * - 通过 sessionStorage 跨越社交登录时的整页跳转（OAuth 流程会离开站点，URL 上的自定义参数无法保留）。
 *
 * 安全性：仅允许内站相对路径，防止开放重定向（open redirect）。
 */

export const REDIRECT_PARAM = 'redirect';
const SOCIAL_REDIRECT_STORAGE_KEY = 'pendingLoginRedirect';

/**
 * 校验候选路径是否为安全的内站相对路径。
 * 合法形式：以 `/` 开头，但不以 `//` 或 `/\` 开头（防止协议相对/反斜杠绕过）。
 */
export function safeRedirectPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  if (!value.startsWith('/')) return null;
  if (value.startsWith('//') || value.startsWith('/\\')) return null;
  return value;
}

/**
 * 从当前 location 构造完整的相对路径（pathname + search + hash），用作 redirect 目标。
 */
export function currentRedirectTarget(location: {
  pathname: string;
  search?: string;
  hash?: string;
}): string {
  return `${location.pathname}${location.search ?? ''}${location.hash ?? ''}`;
}

/**
 * 构造带 redirect 参数的 /login 路径。
 */
export function buildLoginPath(redirect?: string | null): string {
  const safe = safeRedirectPath(redirect);
  if (!safe || safe === '/login') return '/login';
  return `/login?${REDIRECT_PARAM}=${encodeURIComponent(safe)}`;
}

/**
 * 从 URLSearchParams 中读取并校验 redirect 参数。
 */
export function readRedirectFromParams(params: URLSearchParams): string | null {
  return safeRedirectPath(params.get(REDIRECT_PARAM));
}

/**
 * 暂存社交登录的目标 redirect 到 sessionStorage（OAuth 整页跳转后再读取）。
 */
export function stashSocialRedirect(target: string | null): void {
  try {
    const safe = safeRedirectPath(target);
    if (safe) {
      sessionStorage.setItem(SOCIAL_REDIRECT_STORAGE_KEY, safe);
    } else {
      sessionStorage.removeItem(SOCIAL_REDIRECT_STORAGE_KEY);
    }
  } catch {
    // sessionStorage 不可用时静默失败
  }
}

/**
 * 取出并清除社交登录目标。
 */
export function consumeSocialRedirect(): string | null {
  try {
    const value = sessionStorage.getItem(SOCIAL_REDIRECT_STORAGE_KEY);
    sessionStorage.removeItem(SOCIAL_REDIRECT_STORAGE_KEY);
    return safeRedirectPath(value);
  } catch {
    return null;
  }
}
