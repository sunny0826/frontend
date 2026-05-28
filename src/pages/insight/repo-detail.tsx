import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchItemMeta, fetchRepoTrendData } from './api/openDiggerTrend';
import { getLabelDetailPath, getInsightHomePath } from './domain/routes';
import { getRepoUrlByPlatform, normalizeRepoPlatform } from './domain/repoPlatform';
import { normalizeInsightLang } from './domain/lang';
import { TrendChart } from './components/TrendChart';
import { ContributionMap } from './components/ContributionMap';
import { RepoPlatformIcon } from './components/RepoPlatformIcon';
import { LeaderboardAvatar } from './components/LeaderboardAvatar';
import { inferredDeveloperAvatarUrl } from './domain/communityOpenRankDetails';
import { EMPTY_TREND, pickTrendMode } from './domain/trends';
import { preprocessContributions } from './domain/geography';
import type { RepoTrendMap, MetaLabelEntry, ContributionRow, TrendSeries } from './types/api';

function getLatest(t: TrendSeries): number {
  const v = t.values;
  return v.length ? Number(v[v.length - 1]) : 0;
}

function getPrev(t: TrendSeries): number {
  const v = t.values;
  return v.length >= 2 ? Number(v[v.length - 2]) : 0;
}

function getChangePct(latest: number, prev: number): string {
  if (!prev || prev === 0) return latest > 0 ? '+100' : '0';
  const pct = ((latest - prev) / prev) * 100;
  return (pct > 0 ? '+' : '') + pct.toFixed(1);
}

function getStatDelta(latest: number, prev: number): number | null {
  if (prev === 0 && latest === 0) return null;
  return latest - prev;
}

export default function RepoDetailPage() {
  const { platform, owner, repo } = useParams<{ platform: string; owner: string; repo: string }>();
  const repoName = `${owner}/${repo}`;
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = normalizeInsightLang(i18n.language);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<RepoTrendMap | null>(null);
  const [metaLabels, setMetaLabels] = useState<MetaLabelEntry[]>([]);
  const [contributions, setContributions] = useState<ContributionRow[]>([]);
  const [trendMode, setTrendMode] = useState<'month' | 'year'>('month');
  const [description, setDescription] = useState('');

  const normalizedPlatform = normalizeRepoPlatform(platform || 'github');

  useEffect(() => {
    if (!platform || !owner || !repo) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const item = { name: repoName, platform: normalizedPlatform, itemType: 'repo' };
        const [itemMeta, repoTrend] = await Promise.all([
          fetchItemMeta('repo', item),
          fetchRepoTrendData(normalizedPlatform, repoName),
        ]);
        if (cancelled) return;
        setTrendData(repoTrend);
        setMetaLabels(itemMeta.labels);
        setContributions(itemMeta.contributions || []);
        setDescription(itemMeta.description || itemMeta.descriptionZh || '');
      } catch {
        if (!cancelled) setError(t('insight.error'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [platform, owner, repo, normalizedPlatform, repoName, t]);

  const influenceTrend = trendData ? pickTrendMode(trendData.influence, trendMode) : EMPTY_TREND;
  const activityTrend = trendData ? pickTrendMode(trendData.activity, trendMode) : EMPTY_TREND;
  const participantsTrend = trendData ? pickTrendMode(trendData.participants, trendMode) : EMPTY_TREND;
  const issuePrTrend = trendData ? pickTrendMode(trendData.issuePr, trendMode) : EMPTY_TREND;

  const infLatest = getLatest(influenceTrend);
  const infPrev = getPrev(influenceTrend);
  const actLatest = getLatest(activityTrend);
  const actPrev = getPrev(activityTrend);
  const devLatest = getLatest(participantsTrend);
  const devPrev = getPrev(participantsTrend);
  const issuePrLatest = getLatest(issuePrTrend);
  const issuePrPrev = getPrev(issuePrTrend);

  const timeKey = influenceTrend.months.length
    ? influenceTrend.months[influenceTrend.months.length - 1]
    : '';

  const contributionRows = preprocessContributions(contributions);
  const showContributionMap = contributionRows.length > 0;

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-[#94A3B8] text-sm">{t('insight.loadingRepository')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-red-500 text-sm">{error}</div>
          <button
            type="button"
            onClick={() => navigate(getInsightHomePath())}
            className="px-4 py-2 text-sm rounded-lg bg-[#334155] hover:bg-[#475569] text-[#E2E8F0] transition-colors"
          >
            {t('insight.detailBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Repo Info Card */}
      <div className="bg-[#1E293B] rounded-xl border border-[#475569] p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-32 h-32 relative">
            <LeaderboardAvatar
              avatar={inferredDeveloperAvatarUrl(normalizedPlatform, owner || '')}
              displayName={owner || repoName}
              sizeClass="w-32 h-32"
              bordered={false}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h1 className="text-xl font-semibold text-[#E2E8F0]">{repoName}</h1>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-700/50">
                {t('insight.detailSectionRepoSingular')}
              </span>
              {metaLabels.map((label, idx) => {
                const text = lang === 'zh' ? (label.name_zh || label.name || '') : (label.name || label.name_zh || '');
                if (!text) return null;
                const hasLink = Boolean(label.id);
                if (hasLink) {
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="inline-block px-2 py-0.5 rounded text-[11px] font-mono leading-tight bg-[#334155] text-[#E2E8F0] border border-[#475569] hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
                      onClick={() => navigate(getLabelDetailPath(label.id!))}
                    >
                      {text}
                    </button>
                  );
                }
                return (
                  <span
                    key={idx}
                    className="inline-block px-2 py-0.5 rounded text-[11px] font-mono leading-tight bg-[#334155] text-[#94A3B8] border border-[#475569]"
                  >
                    {text}
                  </span>
                );
              })}
            </div>
            {description && (
              <p className="mt-2 text-sm text-[#94A3B8] line-clamp-2">{description}</p>
            )}
          </div>
          <a
            href={getRepoUrlByPlatform(normalizedPlatform, repoName)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#334155] border border-[#475569] text-sm text-[#E2E8F0] hover:bg-[#475569] hover:border-[#64748B] transition-colors"
          >
            <RepoPlatformIcon platform={normalizedPlatform} size="sm" />
            <span>{t('insight.repoVisitExternal')}</span>
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('insight.detailStatOpenRankInfluence')}
          value={infLatest}
          pct={getChangePct(infLatest, infPrev)}
          delta={getStatDelta(infLatest, infPrev)}
          timeKey={timeKey}
        />
        <StatCard
          label={t('insight.detailStatActivity')}
          value={actLatest}
          pct={getChangePct(actLatest, actPrev)}
          delta={getStatDelta(actLatest, actPrev)}
          timeKey={timeKey}
        />
        <StatCard
          label={t('insight.detailStatDeveloperCount')}
          value={devLatest}
          pct={getChangePct(devLatest, devPrev)}
          delta={getStatDelta(devLatest, devPrev)}
          timeKey={timeKey}
        />
        <StatCard
          label={t('insight.detailChartIssuePrTrend')}
          value={issuePrLatest}
          pct={getChangePct(issuePrLatest, issuePrPrev)}
          delta={getStatDelta(issuePrLatest, issuePrPrev)}
          timeKey={timeKey}
        />
      </div>

      {/* Trend Charts */}
      <div className="bg-[#1E293B] rounded-xl border border-[#475569] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-[#E2E8F0]">
            {t('insight.detailHistoricalTrendHeading')}
          </h2>
          <div className="flex rounded-lg bg-[#0F172A] border border-[#475569] p-0.5" role="group" aria-label={t('insight.detailTrendModeAria')}>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${trendMode === 'month' ? 'bg-[#334155] text-[#E2E8F0] shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0]'}`}
              onClick={() => setTrendMode('month')}
            >
              {t('insight.detailTrendModeMonth')}
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${trendMode === 'year' ? 'bg-[#334155] text-[#E2E8F0] shadow-sm' : 'text-[#94A3B8] hover:text-[#E2E8F0]'}`}
              onClick={() => setTrendMode('year')}
            >
              {t('insight.detailTrendModeYear')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#475569]">
            <TrendChart
              values={influenceTrend.values}
              label={t('insight.detailChartInfluenceTrend')}
              monthLabels={influenceTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#475569]">
            <TrendChart
              values={activityTrend.values}
              label={t('insight.detailChartActivityTrend')}
              monthLabels={activityTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#475569]">
            <TrendChart
              values={participantsTrend.values}
              label={t('insight.detailChartParticipantsTrend')}
              monthLabels={participantsTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
          <div className="bg-[#0F172A] rounded-lg p-4 border border-[#475569]">
            <TrendChart
              values={issuePrTrend.values}
              label={t('insight.detailChartIssuePrTrend')}
              monthLabels={issuePrTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
        </div>
      </div>



      {/* Contribution Map */}
      {showContributionMap && (
        <div className="bg-[#1E293B] rounded-xl border border-[#475569] p-6">
          <h2 className="text-base font-semibold text-[#E2E8F0] mb-4">
            {t('insight.detailContributionMapHeading')}
          </h2>
          <ContributionMap contributions={contributions} />
        </div>
      )}
    </div>
  );
}

/* --- Internal StatCard Component --- */
function StatCard({
  label,
  value,
  pct,
  delta,
  timeKey,
}: {
  label: string;
  value: number;
  pct: string;
  delta: number | null;
  timeKey: string;
}) {
  const isPositive = delta !== null && delta > 0;
  const isNegative = delta !== null && delta < 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold text-foreground tabular-nums">
        {value ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '0'}
      </div>
      <div className="mt-1 flex items-center gap-2">
        {delta !== null && (
          <span className={`text-xs font-medium ${isPositive ? 'text-primary' : isNegative ? 'text-destructive' : 'text-muted-foreground'}`}>
            {isPositive ? '↑' : isNegative ? '↓' : ''} {pct}%
          </span>
        )}
        {timeKey && <span className="text-xs text-muted-foreground">{timeKey}</span>}
      </div>
    </div>
  );
}
