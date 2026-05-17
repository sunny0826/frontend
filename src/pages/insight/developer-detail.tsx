import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react/offline';
import { fetchUserMeta, fetchUserTrendData } from './api/openDiggerTrend';
import { getDeveloperProfileUrlByPlatform, inferDeveloperAvatarUrl } from './domain/repoPlatform';
import { getInsightHomePath } from './domain/routes';
import { EMPTY_TREND } from './domain/trends';
import { TrendChart } from './components/TrendChart';
import { RepoPlatformIcon } from './components/RepoPlatformIcon';
import { DeltaDisplay } from './components/DeltaDisplay';
import { LeaderboardAvatar } from './components/LeaderboardAvatar';
import type { RepoTrendMap, TrendSeries, UserOssMeta } from './types/api';

function getLatest(t: TrendSeries | null): number {
  const v = t?.values || [];
  return v.length ? Number(v[v.length - 1]) : 0;
}

function getPrev(t: TrendSeries | null): number {
  const v = t?.values || [];
  return v.length >= 2 ? Number(v[v.length - 2]) : 0;
}

function getDelta(t: TrendSeries | null, latest: number, prev: number): number | null {
  const len = t?.values?.length ?? 0;
  if (len < 2) return null;
  return latest - prev;
}

function StatCard({
  label,
  value,
  delta,
  icon,
  iconColor,
  isInt,
}: {
  label: string;
  value: number;
  delta: number | null;
  icon: string;
  iconColor: string;
  isInt?: boolean;
}) {
  const displayValue = isInt
    ? String(Math.round(value || 0))
    : value ? value.toFixed(1) : '0';
  return (
    <div className="bg-[#1E293B] rounded-xl border border-[#475569] p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Icon icon={icon} className={`w-4 h-4 ${iconColor}`} aria-hidden />
        <span>{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-[#E2E8F0]">
          {displayValue}
        </span>
        <DeltaDisplay value={delta} compact isInt={isInt} />
      </div>
    </div>
  );
}

export default function DeveloperDetailPage() {
  const { platform = 'github', login = '' } = useParams<{ platform: string; login: string }>();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [ossMeta, setOssMeta] = useState<UserOssMeta | null>(null);
  const [trendData, setTrendData] = useState<RepoTrendMap | null>(null);
  const [trendMode, setTrendMode] = useState<'month' | 'year'>('month');

  useEffect(() => {
    if (!login) return;
    let cancelled = false;
    setLoading(true);
    setError(false);

    Promise.all([fetchUserMeta(platform, login), fetchUserTrendData(platform, login)])
      .then(([meta, trends]) => {
        if (cancelled) return;
        if (!meta) {
          setError(true);
        } else {
          setOssMeta(meta);
          setTrendData(trends);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [platform, login]);

  const dataKey = trendMode === 'year' ? 'yearly' : 'monthly';
  const getTrend = (key: keyof RepoTrendMap): TrendSeries => {
    if (!trendData || !trendData[key] || !trendData[key]![dataKey]?.values?.length) return EMPTY_TREND;
    return trendData[key]![dataKey];
  };

  const influenceTrend = getTrend('influence');
  const activityTrend = getTrend('activity');
  const openIssueTrend = getTrend('openIssue');
  const issueCommentTrend = getTrend('issueComment');
  const openPullTrend = getTrend('openPull');
  const reviewCommentTrend = getTrend('reviewComment');

  const infLatest = getLatest(influenceTrend);
  const infPrev = getPrev(influenceTrend);
  const actLatest = getLatest(activityTrend);
  const actPrev = getPrev(activityTrend);
  const oiLatest = getLatest(openIssueTrend);
  const oiPrev = getPrev(openIssueTrend);
  const icLatest = getLatest(issueCommentTrend);
  const icPrev = getPrev(issueCommentTrend);
  const opLatest = getLatest(openPullTrend);
  const opPrev = getPrev(openPullTrend);
  const rcLatest = getLatest(reviewCommentTrend);
  const rcPrev = getPrev(reviewCommentTrend);

  const timeKey = influenceTrend.months?.length
    ? influenceTrend.months[influenceTrend.months.length - 1]
    : '';

  const profileUrl = getDeveloperProfileUrlByPlatform(platform, login);
  const avatarUrl = inferDeveloperAvatarUrl(platform, login, ossMeta?.id);

  const profileLocation = ossMeta?.info?.location?.trim() ?? '';
  const profileCompany = ossMeta?.info?.company?.trim() ?? '';
  const profileBio = ossMeta?.info?.bio?.trim() ?? '';
  const displayName = ossMeta?.info?.name?.trim() || login;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-[#64748B]">
          <Icon icon="mdi:loading" className="text-4xl animate-spin" aria-hidden />
          <p>{t('insight.loadingUser')}</p>
        </div>
      </div>
    );
  }

  if (error || !ossMeta) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-[#94A3B8]">
          <Icon icon="mdi:database-off-outline" className="text-4xl" aria-hidden />
          <p className="text-center px-4">{t('insight.detailUserDataMissing')}</p>
          <Link to={getInsightHomePath()} className="text-[#22C55E] hover:underline text-sm mt-2">
            {t('insight.developerDetailBackToInsight')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {/* Developer info card */}
      <div className="bg-[#1E293B] rounded-xl border border-[#475569] p-6">
        <div className="flex items-start gap-4">
          <div className="w-32 h-32 flex-shrink-0">
            <LeaderboardAvatar
              avatar={avatarUrl}
              displayName={displayName}
              sizeClass="w-32 h-32"
              circular
              bordered={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-[#E2E8F0]">{displayName}</h1>
              <span className="text-[#94A3B8] text-sm">@{login}</span>
            </div>

            {(profileLocation || profileCompany || profileBio) && (
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#94A3B8]">
                {profileLocation && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:map-marker" className="w-4 h-4 text-[#64748B]" aria-hidden />
                    {profileLocation}
                  </span>
                )}
                {profileCompany && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:domain" className="w-4 h-4 text-[#64748B]" aria-hidden />
                    {profileCompany}
                  </span>
                )}
                {profileBio && (
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:card-text-outline" className="w-4 h-4 text-[#64748B]" aria-hidden />
                    {profileBio}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* External link button */}
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-[#475569] rounded-lg text-[#E2E8F0] hover:bg-[#334155] transition-colors flex-shrink-0"
          >
            <RepoPlatformIcon platform={platform} size="sm" />
            <span>{t('insight.detailDeveloperProfile')}</span>
            <Icon icon="mdi:open-in-new" className="w-3.5 h-3.5" aria-hidden />
          </a>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#E2E8F0]">
          {t('insight.detailBasicStatsHeading')}
          {timeKey && <span className="text-[#64748B] font-normal ml-2">({timeKey})</span>}
        </h2>
        <div
          className="flex rounded-lg bg-[#0F172A] border border-[#475569] p-0.5"
          role="group"
          aria-label={t('insight.detailTrendModeAria')}
        >
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              trendMode === 'month'
                ? 'bg-[#334155] text-[#E2E8F0] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
            onClick={() => setTrendMode('month')}
          >
            {t('insight.detailTrendModeMonth')}
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              trendMode === 'year'
                ? 'bg-[#334155] text-[#E2E8F0] shadow-sm'
                : 'text-[#94A3B8] hover:text-[#E2E8F0]'
            }`}
            onClick={() => setTrendMode('year')}
          >
            {t('insight.detailTrendModeYear')}
          </button>
        </div>
      </div>

      {/* Primary stats - OpenRank + Activity */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          icon="mdi:lightning-bolt"
          iconColor="text-purple-500"
          label={t('insight.detailStatOpenRankInfluence')}
          value={infLatest}
          delta={getDelta(influenceTrend, infLatest, infPrev)}
        />
        <StatCard
          icon="mdi:chart-line"
          iconColor="text-emerald-500"
          label={t('insight.detailStatActivity')}
          value={actLatest}
          delta={getDelta(activityTrend, actLatest, actPrev)}
        />
      </div>

      {/* Detail stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon="mdi:clipboard-alert-outline"
          iconColor="text-amber-500"
          label={t('insight.detailStatOpenIssue')}
          value={oiLatest}
          delta={getDelta(openIssueTrend, oiLatest, oiPrev)}
          isInt
        />
        <StatCard
          icon="mdi:comment-outline"
          iconColor="text-sky-500"
          label={t('insight.detailStatIssueComment')}
          value={icLatest}
          delta={getDelta(issueCommentTrend, icLatest, icPrev)}
          isInt
        />
        <StatCard
          icon="mdi:source-pull"
          iconColor="text-indigo-500"
          label={t('insight.detailStatOpenPull')}
          value={opLatest}
          delta={getDelta(openPullTrend, opLatest, opPrev)}
          isInt
        />
        <StatCard
          icon="mdi:comment-check-outline"
          iconColor="text-rose-500"
          label={t('insight.detailStatReviewComment')}
          value={rcLatest}
          delta={getDelta(reviewCommentTrend, rcLatest, rcPrev)}
          isInt
        />
      </div>

      {/* Trend charts */}
      <div className="bg-[#1E293B] rounded-xl border border-[#475569] p-6">
        <h3 className="text-sm font-semibold text-[#E2E8F0] mb-4">
          {t('insight.detailHistoricalTrendHeading')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TrendChart
            values={influenceTrend.values}
            label={t('insight.detailChartInfluenceTrend')}
            monthLabels={influenceTrend.months}
            noDataText={t('insight.noData')}
          />
          <TrendChart
            values={activityTrend.values}
            label={t('insight.detailChartActivityTrend')}
            monthLabels={activityTrend.months}
            noDataText={t('insight.noData')}
          />
        </div>
      </div>
    </div>
  );
}
