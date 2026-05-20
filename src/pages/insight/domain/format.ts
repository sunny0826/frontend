import type { Lang } from '../types/api';

const META_UPDATE_TIME: Record<Lang, string> = {
  zh: '数据更新于 {{year}} 年 {{month}} 月',
  en: 'Data updated at {{month}}, {{year}}',
};

export function formatUpdateTime(timestamp: string | null | undefined, lang: Lang): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const tpl = META_UPDATE_TIME[lang];
  if (lang === 'zh') {
    const month = date.getMonth() + 1;
    return tpl.replace('{{year}}', String(year)).replace('{{month}}', String(month));
  }
  const monthLong = date.toLocaleString('en', { month: 'long' });
  return tpl.replace('{{month}}', monthLong).replace('{{year}}', String(year));
}
