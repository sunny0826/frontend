import { Icon } from '@iconify/react/offline';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LeaderboardItem, LeaderboardMeta, MetaGroupType } from '../types/api';
import { getFilteredLeaderboardData, ITEMS_PER_PAGE, joinZhLeaderboardScopeUnit } from '../domain/leaderboard';
import { formatTimeDisplay } from '../domain/timeRange';
import { leaderboardAvatarForItem } from '../domain/geography';
import { LeaderboardAvatar } from './LeaderboardAvatar';
import { DeltaDisplay } from './DeltaDisplay';

type Props = {
  meta: LeaderboardMeta | null;
  data: LeaderboardItem[];
  scopeName: string;
  unitName: string;
  timeType: 'month' | 'year';
  timeValue: string;
  searchKeyword: string;
  currentPage: number;
  onRowClick: (item: LeaderboardItem) => void;
};

export const LeaderboardSection = forwardRef<HTMLDivElement, Props>(function LeaderboardSection(
  {
    meta,
    data,
    scopeName,
    unitName,
    timeType,
    timeValue,
    searchKeyword,
    currentPage,
    onRowClick,
  }: Props,
  ref,
) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en';

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

  const timeRange = timeType === 'year' ? formatTimeDisplay(timeValue, 'year', lang) : timeValue;

  const leaderboardTitle =
    lang === 'zh'
      ? t('insight.leaderboardTitleTemplate').replace('{{scopeUnit}}', joinZhLeaderboardScopeUnit(title, unitDisplay))
      : t('insight.leaderboardTitleTemplate').replace('{{scope}}', title).replace('{{unit}}', unitDisplay);

  const filtered = getFilteredLeaderboardData(data, searchKeyword);
  const totalItems = filtered.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentPageData = filtered.slice(startIndex, endIndex);

  return (
    <div id="leaderboardContent" className="flex-1 space-y-4 min-w-0">
      <div id="leaderboardTitle" className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm">
        <div className="flex flex-col items-center justify-center text-center">
          <h2 className="text-xl sm:text-2xl font-mono font-bold mb-2 flex items-center justify-center gap-2 text-gray-900">
            <img
              src="https://open-digger.cn/open_leaderboard/images/earth-animation.gif"
              alt=""
              className="w-8 h-8 object-contain flex-shrink-0"
              aria-hidden
            />
            <span className="truncate">{leaderboardTitle}</span>
          </h2>
          <p className="text-gray-500 text-sm flex items-center justify-center gap-1">
            <Icon icon="mdi:calendar-range" className="text-base" aria-hidden />
            {timeRange}
          </p>
        </div>
      </div>

      <div id="leaderboardTable" className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div
          className="flex items-center gap-3 px-3 mb-0.5 border-b border-gray-200 pb-3"
          style={{ paddingTop: '0.125rem' }}
        >
          <div className="flex-shrink-0 flex items-center gap-2 w-24">
            <div className="flex-shrink-0 w-12 text-center">
              <span className="text-sm font-mono font-semibold text-gray-500 leading-tight">{t('insight.headerRank')}</span>
            </div>
            <div className="flex-shrink-0 w-12" />
          </div>
          <div className="w-9 h-9 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-mono font-semibold text-gray-500 leading-tight">{t('insight.headerName')}</span>
          </div>
          <div className="flex-shrink-0 text-right w-32">
            <span className="text-sm font-mono font-semibold text-gray-500 leading-tight">{t('insight.headerOpenRank')}</span>
          </div>
          <div className="flex-shrink-0 text-right w-48">
            <span className="text-sm font-mono font-semibold text-gray-500 leading-tight whitespace-nowrap">
              {t('insight.headerCommunityParticipants')}
            </span>
          </div>
        </div>
        <div id="leaderboardDataRows" ref={ref} className="space-y-1.5">
          {!data || data.length === 0 ? (
            <div className="text-center text-gray-400 py-10 font-mono text-sm">
              <p>{t('insight.noData')}</p>
            </div>
          ) : (
            currentPageData.map((item, index) => {
              const originalIndex = data.findIndex(
                (d) => d.id === item.id || (d.name === item.name && d.name_zh === item.name_zh),
              );
              const rank = originalIndex >= 0 ? originalIndex + 1 : startIndex + index + 1;
              const medalClass =
                rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-orange-400' : 'text-gray-500';
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
                  className="leaderboard-row flex items-center gap-3 py-2 px-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-primary/40 transition-colors duration-200 cursor-pointer"
                  onClick={() => onRowClick({ ...item })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRowClick({ ...item });
                    }
                  }}
                >
                  <div className="flex-shrink-0 flex items-center gap-2 w-24">
                    <div className={`text-lg font-mono font-bold ${medalClass} flex-shrink-0 w-12 text-center`}>
                      {rank < 4 ? (
                        <Icon icon={medalIcon} className="text-xl" aria-hidden />
                      ) : (
                        <span>{rank}</span>
                      )}
                    </div>
                    <div className="flex-shrink-0 w-12 flex items-center justify-start">
                      <DeltaDisplay value={rankDelta} isInt />
                    </div>
                  </div>
                  <div className="w-9 h-9 flex-shrink-0 relative">
                    <LeaderboardAvatar avatar={avatar} displayName={displayName} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-0.5 truncate text-gray-900">{displayName}</div>
                    {displayDesc ? (
                      <div className="text-xs text-gray-500 truncate">{displayDesc}</div>
                    ) : null}
                  </div>
                  <div className="flex-shrink-0 text-right w-32">
                    <div className="text-lg font-mono font-bold text-gray-700">{score.toFixed(1)}</div>
                    <div className="flex items-center justify-end mt-0.5">
                      <DeltaDisplay value={openrankDelta} />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right w-48">
                    <div className="text-lg font-mono font-bold text-gray-700">{Math.round(participants)}</div>
                    <div className="flex items-center justify-end mt-0.5">
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
