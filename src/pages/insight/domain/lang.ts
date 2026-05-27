import type { Lang } from '../types/api';

export function normalizeInsightLang(language: string | null | undefined): Lang {
  return (language ?? '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
}
