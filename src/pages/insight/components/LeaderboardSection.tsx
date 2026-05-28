import { Icon } from '@iconify/react/offline';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LeaderboardItem, LeaderboardMeta, MetaGroupType } from '../types/api';
import { getFilteredLeaderboardData, ITEMS_PER_PAGE, joinZhLeaderboardScopeUnit } from '../domain/leaderboard';
import { leaderboardAvatarForItem } from '../domain/geography';
import { normalizeInsightLang } from '../domain/lang';
import { LeaderboardAvatar } from './LeaderboardAvatar';
import { DeltaDisplay } from './DeltaDisplay';

type HeaderProps = {
  meta: LeaderboardMeta | null;
  scopeName: string;
  unitName: string;
};

export function LeaderboardHeader({ meta, scopeName, unitName }: HeaderProps) {
  const { t, i18n } = useTranslation();
  const lang = normalizeInsightLang(i18n.language);

  const currentScope = meta?.scopes?.find((s) => s.name === scopeName);
  const currentGroupType = meta?.groupTypes?.find((g) => g.name === unitName);

  const title =
    lang === 'zh'
      ? (currentScope?.name_zh || currentScope?.name || scopeName)
      : (currentScope?.name || scopeName);
  const unitDisplay =
    lang === 'zh'
      ? (currentGroupType?.name_zh || currentGroupType?.name || unitName)
      : (currentGroupType?.name || unitName);

  const leaderboardTitle =
    lang === 'zh'
      ? t('insight.leaderboardTitleTemplate').replace('{{scopeUnit}}', joinZhLeaderboardScopeUnit(title, unitDisplay))
      : t('insight.leaderboardTitleTemplate').replace('{{scope}}', title).replace('{{unit}}', unitDisplay);

  return (
    <div id="leaderboardTitle" className="px-6 pb-3 pt-5">
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="flex items-center justify-center gap-2 text-balance text-lg font-semibold text-foreground sm:text-xl">
          <span className="truncate">{leaderboardTitle}</span>
        </h2>
      </div>
    </div>
  );
}

type Props = {
  meta: LeaderboardMeta | null;
  data: LeaderboardItem[];
  unitName: string;
  scopeName: string;
  searchKeyword: string;
  currentPage: number;
  onRowClick: (item: LeaderboardItem) => void;
};

export const LeaderboardSection = forwardRef<HTMLDivElement, Props>(function LeaderboardSection(
  {
    meta,
    data,
    unitName,
    scopeName,
    searchKeyword,
    currentPage,
    onRowClick,
  }: Props,
  ref,
) {
  const { t, i18n } = useTranslation();
  const lang = normalizeInsightLang(i18n.language);

  const currentGroupType = meta?.groupTypes?.find((g) => g.name === unitName);

  const filtered = getFilteredLeaderboardData(data, searchKeyword);
  const totalItems = filtered.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentPageData = filtered.slice(startIndex, endIndex);

  return (
    <div id="leaderboardContent" className="min-w-0 flex-1">
      <div id="leaderboardTable" className="rounded-xl border border-border bg-card pb-6 shadow-sm">
        <LeaderboardHeader meta={meta} scopeName={scopeName} unitName={unitName} />
        <div
          className="mx-6 flex items-center gap-3 border-b border-border px-3 pb-2"
        >
          <div className="flex w-24 flex-shrink-0 items-center gap-2">
            <div className="w-12 flex-shrink-0 text-center">
              <span className="font-mono text-xs font-semibold leading-tight text-muted-foreground">{t('insight.headerRank')}</span>
            </div>
            <div className="w-12 flex-shrink-0" />
          </div>
          <div className="size-9 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <span className="font-mono text-xs font-semibold leading-tight text-muted-foreground">{t('insight.headerName')}</span>
          </div>
          <div className="w-32 flex-shrink-0 text-right">
            <span className="font-mono text-xs font-semibold leading-tight text-muted-foreground">{t('insight.headerOpenRank')}</span>
          </div>
          <div className="w-48 flex-shrink-0 text-right">
            <span className="whitespace-nowrap font-mono text-xs font-semibold leading-tight text-muted-foreground">
              {t('insight.headerCommunityParticipants')}
            </span>
          </div>
        </div>
        <div id="leaderboardDataRows" ref={ref} className="space-y-1.5 px-6 pt-2">
          {!data || data.length === 0 ? (
            <div className="py-10 text-center font-mono text-sm text-muted-foreground">
              <p>{t('insight.noData')}</p>
            </div>
          ) : (
            currentPageData.map((item, index) => {
              const originalIndex = data.findIndex(
                (d) => d.id === item.id || (d.name === item.name && d.name_zh === item.name_zh),
              );
              const rank = originalIndex >= 0 ? originalIndex + 1 : startIndex + index + 1;
              const medalClass =
                rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-muted-foreground' : rank === 3 ? 'text-orange-400' : 'text-muted-foreground';
              const medalIcon =
                rank === 1
                  ? 'mdi:trophy'
                  : rank === 2
                    ? 'mdi:trophy-outline'
                    : rank === 3
                      ? 'mdi:medal'
                      : `mdi:numeric-${rank}-circle`;

              const displayName =
                lang === 'zh' ? (item.name_zh || item.name || '') : (item.name || '');
              const displayDesc =
                lang === 'zh'
                  ? (item.description_zh || item.description || '')
                  : (item.description || item.description_zh || '');
              const score = item.openrank || 0;
              const openrankDelta =
                item.openrankDelta !== undefined && item.openrankDelta !== null ? item.openrankDelta : 0;
              const participants = item.participants || 0;
              const participantsDelta =
                item.participantsDelta !== undefined && item.participantsDelta !== null
                  ? item.participantsDelta
                  : 0;
              const rankDelta = item.rankDelta !== undefined && item.rankDelta !== null ? item.rankDelta : 0;

              const avatar = leaderboardAvatarForItem(item, unitName, currentGroupType as MetaGroupType);

              return (
                <div
                  key={`${item.id ?? item.name}-${startIndex + index}`}
                  role="button"
                  tabIndex={0}
                  className="leaderboard-row flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-transparent bg-background/70 px-3 py-2 outline-none transition-[background-color,border-color,box-shadow] duration-150 hover:border-border hover:bg-secondary/60 focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => onRowClick({ ...item })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick({ ...item });
                    }
                  }}
                >
                  <div className="flex w-24 flex-shrink-0 items-center gap-2">
                    <div className={`font-mono text-base font-semibold ${medalClass} w-12 flex-shrink-0 text-center`}>
                      {rank < 4 ? (
                        <Icon icon={medalIcon} className="text-xl" aria-hidden />
                      ) : (
                        <span>{rank}</span>
                      )}
                    </div>
                    <div className="flex w-12 flex-shrink-0 items-center justify-start">
                      <DeltaDisplay value={rankDelta} isInt />
                    </div>
                  </div>
                  <div className="relative size-9 flex-shrink-0">
                    <LeaderboardAvatar avatar={avatar} displayName={displayName} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 truncate text-sm font-semibold text-foreground">{displayName}</div>
                    {displayDesc ? (
                      <div className="truncate text-xs text-muted-foreground">{displayDesc}</div>
                    ) : null}
                  </div>
                  <div className="w-32 flex-shrink-0 text-right">
                    <div className="font-mono text-base font-semibold text-foreground tabular-nums">{score.toFixed(1)}</div>
                    <div className="mt-0.5 flex items-center justify-end">
                      <DeltaDisplay value={openrankDelta} />
                    </div>
                  </div>
                  <div className="w-48 flex-shrink-0 text-right">
                    <div className="font-mono text-base font-semibold text-foreground tabular-nums">{Math.round(participants)}</div>
                    <div className="mt-0.5 flex items-center justify-end">
                      <DeltaDisplay value={participantsDelta} isInt />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
