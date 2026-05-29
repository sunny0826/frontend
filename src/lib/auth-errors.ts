/**
 * 认证/账户相关错误码 → i18n key 映射。
 *
 * 后端错误响应结构：
 *   { code: string, message: string, detail?: { field: [{ code, message }] } }
 *
 * 前端展示错误时，优先根据 code 查找对应 i18n 文案，避免直接展示后端 message。
 */

import type { TFunction } from 'i18next';
import type { ApiError } from './api';

/** 顶层 code → i18n key。 */
const TOP_LEVEL_ERROR_I18N: Record<string, string> = {
  // 登录相关
  account_disabled: 'errors.account_disabled',
  account_merged: 'errors.account_merged',

  // Token
  invalid_token: 'errors.invalid_token',

  // 验证
  validation_error: 'errors.validation_error',

  // 社交登录
  provider_not_found: 'errors.provider_not_found',
  provider_not_configured: 'errors.provider_not_configured',
  authentication_failed: 'errors.social_authentication_failed',
  provider_not_connected: 'errors.provider_not_connected',
  email_conflict_requires_binding: 'errors.email_conflict_requires_binding',
  invalid_exchange_code: 'errors.invalid_exchange_code',
  social_exchange_unavailable: 'errors.social_exchange_unavailable',

  // 社交连接
  not_found: 'errors.not_found',
  last_auth_method: 'errors.last_auth_method',

  // 账户合并
  merge_request_conflict: 'errors.merge_request_conflict',
  merge_request_expired: 'errors.merge_request_expired',
  merge_request_not_pending: 'errors.merge_request_not_pending',
  merge_failed: 'errors.merge_failed',
};

/** 字段级 code → i18n key（Django 内置 + 项目自定义）。 */
const FIELD_ERROR_I18N: Record<string, string> = {
  // Django 字段层级内置
  unique: 'errors.field_unique',
  required: 'errors.field_required',
  invalid: 'errors.field_invalid',
  max_length: 'errors.field_max_length',
  min_length: 'errors.field_min_length',

  // 账户合并（表单级 code 也可能出现在 detail.__all__ 中）
  merge_target_required: 'errors.merge_target_required',
  merge_target_not_found: 'errors.merge_target_not_found',
  merge_target_ambiguous: 'errors.merge_target_ambiguous',
  merge_source_is_staff: 'errors.merge_source_is_staff',
  merge_source_inactive: 'errors.merge_source_inactive',
  merge_target_is_self: 'errors.merge_target_is_self',
  merge_target_is_staff: 'errors.merge_target_is_staff',
  merge_source_has_pending: 'errors.merge_source_has_pending',
  merge_target_pending_limit: 'errors.merge_target_pending_limit',
};

/** 查找顶层错误码对应 i18n 翻译；找不到时返回 null。 */
export function translateTopLevelCode(
  t: TFunction,
  code: string | undefined,
): string | null {
  if (!code) return null;
  const key = TOP_LEVEL_ERROR_I18N[code];
  return key ? t(key) : null;
}

/** 查找字段级错误码对应 i18n 翻译；找不到时返回 null。 */
export function translateFieldCode(
  t: TFunction,
  code: string | undefined,
): string | null {
  if (!code) return null;
  const key = FIELD_ERROR_I18N[code];
  return key ? t(key) : null;
}

/**
 * 将后端 ApiError 解析为本地化的顶层错误消息。
 *
 * 策略：
 * 1. 若顶层 code 能命中映射，直接使用。
 * 2. 若是 validation_error，尝试从 detail 中取第一条带 code 的字段错误翻译。
 * 3. 兜底回退到 fallback（推荐传入页面通用失败文案）。
 *
 * **重要**：不再直接展示 apiError.message，避免英文消息泄露到中文界面。
 */
export function resolveApiErrorMessage(
  t: TFunction,
  apiError: ApiError,
  fallback: string,
): string {
  // 1. 顶层 code 命中
  const top = translateTopLevelCode(t, apiError.code);
  if (top) return top;

  // 2. 从 detail 中兜底取第一条带 code 的字段错误
  if (apiError.detail) {
    for (const errors of Object.values(apiError.detail)) {
      if (Array.isArray(errors)) {
        for (const err of errors) {
          const translated = translateFieldCode(t, err?.code);
          if (translated) return translated;
        }
      }
    }
  }

  return fallback;
}

/**
 * 将字段级错误应用到 react-hook-form。
 *
 * @param detail 后端 `apiError.detail`
 * @param fieldMap 后端字段名 → 前端表单字段名的映射
 * @param setError react-hook-form 的 setError
 * @param t i18n
 * @returns 是否至少成功设置了一个字段错误
 */
export function applyFieldErrors<TField extends string>(
  detail: ApiError['detail'] | undefined,
  fieldMap: Record<string, TField>,
  setError: (field: TField, error: { message: string }) => void,
  t: TFunction,
): boolean {
  if (!detail) return false;
  let applied = false;
  for (const [backendField, errors] of Object.entries(detail)) {
    const formField = fieldMap[backendField];
    if (!formField || !Array.isArray(errors) || errors.length === 0) continue;
    const first = errors[0];
    const message =
      translateFieldCode(t, first?.code) ??
      t('errors.field_invalid');
    setError(formField, { message });
    applied = true;
  }
  return applied;
}
