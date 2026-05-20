import { useCallback, useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/offline';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchLeaderboardData, fetchLeaderboardMeta } from './api/openLeaderboard';
import { buildDataUrl, getItemTypeFromUnit, ITEMS_PER_PAGE } from './domain/leaderboard';
import { computeInitialTimeValue } from './domain/timeRange';
import { defaultScopeValue, defaultUnitValue, filterGroupTypesForUnitDropdown } from './domain/meta';
import { formatUpdateTime } from './domain/format';
import { getLabelDetailPath, getRepoDetailPath, getDeveloperDetailPath } from './domain/routes';
import type { LeaderboardItem, LeaderboardMeta } from './types/api';
import { FilterPanel } from './components/FilterPanel';
import { SiteSearchBox } from '@/app/components/site-search-box';
import { LeaderboardSection } from './components/LeaderboardSection';
import { PaginationControl } from './components/PaginationControl';

function ContentMessage({ type, message }: { type: 'error' | 'loading' | 'plain'; message: string }) {
  const boxClass = 'bg-[#1E293B] rounded-xl border border-[#475569] shadow-sm';
  const padding = type === 'loading' ? 'p-8' : 'p-6';
  if (type === 'error') {
    return (
      <div className={`${boxClass} ${padding}`}>
        <div className="text-center text-red-500">
          <Icon icon="mdi:alert-circle" className="text-3xl mb-2" aria-hidden />
          <p>{message}</p>
        </div>
      </div>
    );
  }
  if (type === 'loading') {
    return (
      <div className={`${boxClass} ${padding}`}>
        <div className="text-center text-[#94A3B8]">
          <Icon icon="mdi:loading" className="text-3xl mb-2 animate-spin" aria-hidden />
          <p>{message}</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`${boxClass} ${padding}`}>
      <div className="text-center text-[#94A3B8]">
        <p>{message}</p>
      </div>
    </div>
  );
}

export default function InsightPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en';
  const navigate = useNavigate();

  const [meta, setMeta] = useState<LeaderboardMeta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [filtersReady, setFiltersReady] = useState(false);
  const [scopeValue, setScopeValue] = useState('');
  const [unitValue, setUnitValue] = useState('');
  const [timeType, setTimeType] = useState<'month' | 'year'>('month');
  const [timeValue, setTimeValue] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [filterCollapsed, setFilterCollapsed] = useState(false);
  const leaderboardRowsRef = useRef<HTMLDivElement>(null);

  // Fetch meta on mount
  useEffect(() => {
    let cancelled = false;
    void fetchLeaderboardMeta()
      .then((m) => {
        if (cancelled) return;
        setMeta(m);
        const filteredUnits = filterGroupTypesForUnitDropdown(m.groupTypes);
        setScopeValue(defaultScopeValue(m.scopes, null));
        setUnitValue(defaultUnitValue(filteredUnits, null));
        setTimeValue(computeInitialTimeValue('month', m, ''));
        setFiltersReady(true);
        setMetaError(null);
      })
      .catch((e: Error) => {
        if (!cancelled) setMetaError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch leaderboard data when filters change
  useEffect(() => {
    if (!filtersReady || !scopeValue || !unitValue || !timeValue) return;
    const url = buildDataUrl({ scopeName: scopeValue, groupTypeName: unitValue, timeType, timeValue });
    if (!url) return;
    let cancelled = false;
    setBoardLoading(true);
    setBoardError(null);
    void fetchLeaderboardData(url)
      .then((data) => {
        if (cancelled) return;
        setLeaderboardData(data);
        setCurrentPage(1);
        setBoardLoading(false);
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setBoardError(e.message);
        setBoardLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filtersReady, scopeValue, unitValue, timeType, timeValue]);

  const filteredCount = leaderboardData.filter((item) => {
    if (!searchKeyword.trim()) return true;
    const k = searchKeyword.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(k) ||
      (item.name_zh || '').toLowerCase().includes(k) ||
      (item.id || '').toLowerCase().includes(k)
    );
  }).length;
  const totalPages = Math.ceil(filteredCount / ITEMS_PER_PAGE);

  const scrollToLeaderboardRows = useCallback(() => {
    const el = leaderboardRowsRef.current;
    if (!el) return;
    const headerHeight = 80;
    const dataTop = el.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top: dataTop, behavior: 'smooth' });
  }, []);

  const handlePageChange = useCallback(
    (p: number) => {
      if (p < 1 || p > totalPages) return;
      setCurrentPage(p);
      requestAnimationFrame(scrollToLeaderboardRows);
    },
    [totalPages, scrollToLeaderboardRows],
  );

  const commitFilterChange = useCallback(() => {
    setSearchKeyword('');
    setCurrentPage(1);
  }, []);

  const handleRowClick = (item: LeaderboardItem) => {
    const itemType = getItemTypeFromUnit(unitValue);
    const rawId = item.id || '';
    // Labels are identified by a leading ':' (or '#') prefix in their id.
    // Repos use a numeric id, and their `owner/repo` full name lives in `name`.
    const isLabelId = rawId.startsWith(':') || rawId.startsWith('#');
    if (itemType === 'label' || isLabelId) {
      navigate(getLabelDetailPath(rawId));
    } else if (itemType === 'repo') {
      // Prefer `name` (e.g. "owner/repo") over the numeric `id`.
      const fullName = item.name && item.name.includes('/') ? item.name : rawId;
      const [owner, repo] = fullName.split('/');
      if (!owner || !repo) {
        return;
      }
      navigate(getRepoDetailPath(item.platform || 'github', owner, repo));
    } else {
      navigate(getDeveloperDetailPath(item.platform || 'github', item.login || item.name || rawId));
    }
  };

  const updateTimeLabel = formatUpdateTime(meta?.updatedAt, lang);

  return (
    <div className="mx-auto space-y-6">
      {filtersReady && meta && !metaError ? (
        <SiteSearchBox variant="insight" />
      ) : null}
      <div className="flex gap-6 items-start">
        {metaError ? (
          <div className="flex-1 min-w-0">
            <ContentMessage type="error" message={`${t('insight.error')}: ${metaError}`} />
          </div>
        ) : !filtersReady ? (
          <div className="flex-1 min-w-0">
            <ContentMessage type="loading" message={t('insight.loading')} />
          </div>
        ) : boardLoading ? (
          <div className="flex-1 min-w-0">
            <ContentMessage type="loading" message={t('insight.loading')} />
          </div>
        ) : boardError ? (
          <div className="flex-1 min-w-0">
            <ContentMessage type="error" message={`${t('insight.error')}: ${boardError}`} />
          </div>
        ) : (
          <LeaderboardSection
            ref={leaderboardRowsRef}
            meta={meta}
            data={leaderboardData}
            unitName={unitValue}
            scopeName={scopeValue}
            searchKeyword={searchKeyword}
            currentPage={currentPage}
            onRowClick={handleRowClick}
          />
        )}
        <FilterPanel
          meta={meta}
          scopeValue={scopeValue}
          unitValue={unitValue}
          timeType={timeType}
          timeValue={timeValue}
          searchKeyword={searchKeyword}
          onScopeChange={(v) => {
            setScopeValue(v);
            commitFilterChange();
          }}
          onUnitChange={(v) => {
            setUnitValue(v);
            commitFilterChange();
          }}
          onTimeTypeChange={setTimeType}
          onTimeValueChange={setTimeValue}
          onSearchChange={(v) => {
            setSearchKeyword(v);
            setCurrentPage(1);
          }}
          onSearchClear={() => {
            setSearchKeyword('');
            setCurrentPage(1);
          }}
          onTimeCommit={commitFilterChange}
          filterCollapsed={filterCollapsed}
          onToggleCollapse={() => setFilterCollapsed((c) => !c)}
          paginationSlot={
            <PaginationControl
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          }
        />
      </div>
      {updateTimeLabel && (
        <p className="text-sm text-[#94A3B8] text-center">{updateTimeLabel}</p>
      )}
    </div>
  );
}
