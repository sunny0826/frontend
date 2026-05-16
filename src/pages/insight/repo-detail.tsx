import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchItemMeta, fetchRepoTrendData } from './api/openDiggerTrend';
import { getLabelDetailPath, getInsightHomePath } from './domain/routes';
import { getRepoUrlByPlatform, normalizeRepoPlatform } from './domain/repoPlatform';
import { TrendChart } from './components/TrendChart';
import { ContributionMap } from './components/ContributionMap';
import { RepoPlatformIcon } from './components/RepoPlatformIcon';
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
  const lang = i18n.language as 'zh' | 'en';

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
          <div className="text-gray-500 text-sm">{t('insight.loadingRepository')}</div>
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
            className="px-4 py-2 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            {t('insight.detailBack')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link to={getInsightHomePath()} className="hover:text-gray-900 transition-colors">
          {t('nav.insight')}
        </Link>
        <span>/</span>
        <span className="text-gray-400">{normalizedPlatform}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{repoName}</span>
      </nav>

      {/* Repo Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            <RepoPlatformIcon platform={normalizedPlatform} size="md" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-gray-900">{repoName}</h1>
              <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {t('insight.detailSectionRepoSingular')}
              </span>
            </div>
            {description && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">{description}</p>
            )}
          </div>
          <a
            href={getRepoUrlByPlatform(normalizedPlatform, repoName)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
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
          colorClass="from-purple-50 to-white"
        />
        <StatCard
          label={t('insight.detailStatActivity')}
          value={actLatest}
          pct={getChangePct(actLatest, actPrev)}
          delta={getStatDelta(actLatest, actPrev)}
          timeKey={timeKey}
          colorClass="from-emerald-50 to-white"
        />
        <StatCard
          label={t('insight.detailStatDeveloperCount')}
          value={devLatest}
          pct={getChangePct(devLatest, devPrev)}
          delta={getStatDelta(devLatest, devPrev)}
          timeKey={timeKey}
          colorClass="from-blue-50 to-white"
        />
        <StatCard
          label={t('insight.detailChartIssuePrTrend')}
          value={issuePrLatest}
          pct={getChangePct(issuePrLatest, issuePrPrev)}
          delta={getStatDelta(issuePrLatest, issuePrPrev)}
          timeKey={timeKey}
          colorClass="from-amber-50 to-white"
        />
      </div>

      {/* Trend Charts */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-gray-900">
            {t('insight.detailHistoricalTrendHeading')}
          </h2>
          <div className="flex rounded-lg bg-gray-100 border border-gray-200 p-0.5" role="group" aria-label={t('insight.detailTrendModeAria')}>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${trendMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setTrendMode('month')}
            >
              {t('insight.detailTrendModeMonth')}
            </button>
            <button
              type="button"
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${trendMode === 'year' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setTrendMode('year')}
            >
              {t('insight.detailTrendModeYear')}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <TrendChart
              values={influenceTrend.values}
              label={t('insight.detailChartInfluenceTrend')}
              monthLabels={influenceTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <TrendChart
              values={activityTrend.values}
              label={t('insight.detailChartActivityTrend')}
              monthLabels={activityTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <TrendChart
              values={participantsTrend.values}
              label={t('insight.detailChartParticipantsTrend')}
              monthLabels={participantsTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <TrendChart
              values={issuePrTrend.values}
              label={t('insight.detailChartIssuePrTrend')}
              monthLabels={issuePrTrend.months}
              noDataText={t('insight.noData')}
            />
          </div>
        </div>
      </div>

      {/* Related Labels */}
      {metaLabels.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            {t('insight.repoRelatedLabels')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {metaLabels.map((label, idx) => {
              const text = lang === 'zh' ? (label.name_zh || label.name || '') : (label.name || label.name_zh || '');
              if (!text) return null;
              const hasLink = Boolean(label.id);
              if (hasLink) {
                return (
                  <button
                    key={idx}
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors cursor-pointer"
                    onClick={() => navigate(getLabelDetailPath(label.id!))}
                  >
                    {text}
                  </button>
                );
              }
              return (
                <span
                  key={idx}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600"
                >
                  {text}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Contribution Map */}
      {showContributionMap && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">
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
  colorClass,
}: {
  label: string;
  value: number;
  pct: string;
  delta: number | null;
  timeKey: string;
  colorClass: string;
}) {
  const isPositive = delta !== null && delta > 0;
  const isNegative = delta !== null && delta < 0;

  return (
    <div className={`rounded-xl border border-gray-200 p-4 bg-gradient-to-br ${colorClass}`}>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">
        {value ? value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : '0'}
      </div>
      <div className="flex items-center gap-2 mt-1">
        {delta !== null && (
          <span className={`text-xs font-medium ${isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-gray-400'}`}>
            {isPositive ? '↑' : isNegative ? '↓' : ''} {pct}%
          </span>
        )}
        {timeKey && <span className="text-xs text-gray-400">{timeKey}</span>}
      </div>
    </div>
  );
}
