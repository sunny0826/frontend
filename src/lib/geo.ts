/**
 * Geo utilities: store and read the mainland China IP detection result.
 *
 * The login page calls `/common/region` and persists the result in
 * localStorage so that post-login pages can conditionally show/hide
 * withdrawal-related features (only available to mainland China users).
 *
 * ## Localhost Override (开发/测试用)
 * 当前端运行在 localhost 时，支持通过 URL 参数 `is_mainland_cn=1` 强制
 * 覆盖后端返回结果（视为大陆 IP）。该覆盖值存入 sessionStorage，在同一
 * 标签页会话内持续生效，页面跳转时通过 `useGeoParamSync` hook 自动将
 * 参数保留在 URL 中。正式部署（非 localhost）时此机制不生效。
 */

const GEO_KEY = 'is_mainland_cn';
const GEO_DEV_OVERRIDE_KEY = 'is_mainland_cn_dev_override';

// ---------------------------------------------------------------------------
// Localhost override helpers
// ---------------------------------------------------------------------------

function isLocalhost(): boolean {
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}

/**
 * 初始化 localhost 开发覆盖。
 * 应在应用启动时（如 RootLayout mount）调用一次。
 * - `is_mainland_cn=1` → 开启覆盖（视为大陆 IP）
 * - `is_mainland_cn=0` → 清除覆盖（恢复后端真实结果）
 */
export function initLocalhostGeoOverride(): void {
  if (!isLocalhost()) return;
  const params = new URLSearchParams(window.location.search);
  const val = params.get('is_mainland_cn');
  if (val === '1') {
    sessionStorage.setItem(GEO_DEV_OVERRIDE_KEY, '1');
  } else if (val === '0') {
    sessionStorage.removeItem(GEO_DEV_OVERRIDE_KEY);
  }
}

/**
 * 判断当前是否处于 localhost 强制覆盖状态。
 */
export function hasLocalhostOverride(): boolean {
  return isLocalhost() && sessionStorage.getItem(GEO_DEV_OVERRIDE_KEY) === '1';
}

// ---------------------------------------------------------------------------
// Core API
// ---------------------------------------------------------------------------

/**
 * Persist the region detection result.
 * @param value `true` = mainland China, `false` = not, `null` = unknown
 */
export function storeIsMainlandCn(value: boolean | null): void {
  if (value === null) {
    // Unknown → treat as non-mainland (do not show withdrawal features)
    localStorage.setItem(GEO_KEY, 'false');
  } else {
    localStorage.setItem(GEO_KEY, String(value));
  }
}

/**
 * Read the stored region detection result.
 * Returns `true` only if explicitly stored as "true".
 *
 * On localhost with `is_mainland_cn=1` override active, always returns `true`.
 */
export function getIsMainlandCn(): boolean {
  if (hasLocalhostOverride()) return true;
  return localStorage.getItem(GEO_KEY) === 'true';
}

/**
 * Check if the geo value has been stored (i.e. region check has been done).
 */
export function hasGeoStored(): boolean {
  if (hasLocalhostOverride()) return true;
  return localStorage.getItem(GEO_KEY) !== null;
}
