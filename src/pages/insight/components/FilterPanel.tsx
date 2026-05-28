import { Icon } from '@iconify/react/offline';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { LeaderboardMeta } from '../types/api';
import { filterGroupTypesForUnitDropdown } from '../domain/meta';
import { TimeRangePicker } from './TimeRangePicker';
import { computeInitialTimeValue } from '../domain/timeRange';
import { normalizeInsightLang } from '../domain/lang';

type Props = {
  meta: LeaderboardMeta | null;
  scopeValue: string;
  unitValue: string;
  timeType: 'month' | 'year';
  timeValue: string;
  searchKeyword: string;
  onScopeChange: (v: string) => void;
  onUnitChange: (v: string) => void;
  onTimeTypeChange: (v: 'month' | 'year') => void;
  onTimeValueChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onSearchClear: () => void;
  onTimeCommit: () => void;
  filterCollapsed: boolean;
  onToggleCollapse: () => void;
  paginationSlot: ReactNode;
};

function preventFilterDropdownScrollChaining(e: React.WheelEvent<HTMLDivElement>) {
  const menu = e.currentTarget;
  if (!menu.classList.contains('show')) return;
  const { scrollTop, clientHeight, scrollHeight } = menu;
  const atTop = scrollTop <= 0;
  const atBottom = scrollTop + clientHeight >= scrollHeight - 1;
  if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
    e.preventDefault();
  }
}

export function FilterPanel({
  meta,
  scopeValue,
  unitValue,
  timeType,
  timeValue,
  searchKeyword,
  onScopeChange,
  onUnitChange,
  onTimeTypeChange,
  onTimeValueChange,
  onSearchChange,
  onSearchClear,
  onTimeCommit,
  filterCollapsed,
  onToggleCollapse,
  paginationSlot,
}: Props) {
  const { t, i18n } = useTranslation();
  const lang = normalizeInsightLang(i18n.language);
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const [unitMenuOpen, setUnitMenuOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  const anyFilterOpen = scopeMenuOpen || unitMenuOpen;
  useEffect(() => {
    if (anyFilterOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
    };
  }, [anyFilterOpen]);

  const closeOnOutside = useCallback((e: MouseEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest('#scopeDropdownWrap') || t.closest('#unitDropdownWrap')) return;
    setScopeMenuOpen(false);
    setUnitMenuOpen(false);
  }, []);

  useEffect(() => {
    if (scopeMenuOpen || unitMenuOpen) {
      setTimeout(() => document.addEventListener('click', closeOnOutside), 0);
    } else {
      document.removeEventListener('click', closeOnOutside);
    }
    return () => document.removeEventListener('click', closeOnOutside);
  }, [scopeMenuOpen, unitMenuOpen, closeOnOutside]);

  const scopes = meta?.scopes ?? [];
  const filteredUnits = meta ? filterGroupTypesForUnitDropdown(meta.groupTypes) : [];

  const scopeLabel = (() => {
    const s = scopes.find((x) => x && (x.name === scopeValue || x.name_zh === scopeValue));
    if (!s) return scopeValue || t('insight.loading');
    return lang === 'zh' ? (s.name_zh ?? s.name ?? '') : (s.name ?? s.name_zh ?? '');
  })();

  const unitLabel = (() => {
    const g = filteredUnits.find((x) => x && (x.name === unitValue || x.name_zh === unitValue));
    if (!g) return unitValue || t('insight.loading');
    return lang === 'zh' ? (g.name_zh ?? g.name ?? '') : (g.name ?? g.name_zh ?? '');
  })();

  return (
    <div
      id="filterPanel"
      className={`flex-shrink-0 transition-all duration-150 max-xl:!w-full ${timePickerOpen ? 'overflow-visible' : 'overflow-hidden'}`}
      style={{ width: filterCollapsed ? '60px' : '20rem' }}
    >
      <div className="sticky top-6 rounded-xl border border-border bg-card p-4 shadow-sm max-xl:static">
        <button
          type="button"
          id="filterToggle"
          title={t('insight.filterPanelToggleTitle')}
          onClick={onToggleCollapse}
          className="mb-4 flex w-full cursor-pointer items-center gap-2 rounded-lg text-sm font-semibold text-foreground outline-none transition-colors duration-150 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
          style={{ justifyContent: filterCollapsed ? 'center' : 'space-between' }}
        >
          <div className="flex min-w-0 items-center gap-2" style={{ display: filterCollapsed ? 'none' : 'flex' }}>
            <Icon icon="mdi:filter" className="flex-shrink-0" />
            <span id="filterTitleText" className="truncate">
              {t('insight.filterConditions')}
            </span>
          </div>
          <Icon
            id="filterToggleIcon"
            icon={filterCollapsed ? 'mdi:chevron-down' : 'mdi:chevron-up'}
            className="flex-shrink-0 transition-transform duration-150"
            style={{ transform: filterCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        </button>
        <div id="filterContent" className="space-y-4" style={{ display: filterCollapsed ? 'none' : 'block' }}>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon icon="mdi:earth" />
              <span>{t('insight.leaderboardScope')}</span>
            </label>
            <div className="filter-dropdown relative" id="scopeDropdownWrap">
              <button
                type="button"
                id="scopeSelectTrigger"
                className="filter-select-trigger h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 focus:border-primary focus:ring-2 focus:ring-ring"
                aria-haspopup="listbox"
                aria-expanded={scopeMenuOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setUnitMenuOpen(false);
                  setScopeMenuOpen((o) => !o);
                }}
              >
                <span id="scopeSelectLabel">{scopeLabel}</span>
              </button>
              <div
                id="scopeDropdownMenu"
                className={`filter-dropdown-menu ${scopeMenuOpen ? 'show' : ''}`}
                role="listbox"
                onWheel={preventFilterDropdownScrollChaining}
              >
                {scopes.map((s) => {
                  const name = s.name ?? s.name_zh ?? '';
                  if (!name) return null;
                  const display = lang === 'zh' ? (s.name_zh ?? s.name ?? name) : (s.name ?? s.name_zh ?? name);
                  const active = name === scopeValue;
                  return (
                    <div
                      key={name}
                      role="option"
                      className={`filter-dropdown-item ${active ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onScopeChange(name);
                        setScopeMenuOpen(false);
                      }}
                    >
                      {display}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon icon="mdi:chart-bar" />
              <span>{t('insight.rankingUnit')}</span>
            </label>
            <div className="filter-dropdown relative" id="unitDropdownWrap">
              <button
                type="button"
                id="unitSelectTrigger"
                className="filter-select-trigger h-10 w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 focus:border-primary focus:ring-2 focus:ring-ring"
                aria-haspopup="listbox"
                aria-expanded={unitMenuOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setScopeMenuOpen(false);
                  setUnitMenuOpen((o) => !o);
                }}
              >
                <span id="unitSelectLabel">{unitLabel}</span>
              </button>
              <div
                id="unitDropdownMenu"
                className={`filter-dropdown-menu ${unitMenuOpen ? 'show' : ''}`}
                role="listbox"
                onWheel={preventFilterDropdownScrollChaining}
              >
                {filteredUnits.map((g) => {
                  const name = g.name ?? g.name_zh ?? '';
                  if (!name) return null;
                  const display = lang === 'zh' ? (g.name_zh ?? g.name ?? name) : (g.name ?? g.name_zh ?? name);
                  const active = name === unitValue;
                  return (
                    <div
                      key={name}
                      role="option"
                      className={`filter-dropdown-item ${active ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnitChange(name);
                        setUnitMenuOpen(false);
                      }}
                    >
                      {display}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon icon="mdi:calendar" />
              <span>{t('insight.timeRangeType')}</span>
            </label>
            <div
              id="timeTypeToggleGroup"
              className="flex rounded-lg border border-border bg-background p-0.5"
              role="group"
              aria-label={t('insight.timeRangeTypeToggle')}
            >
              <button
                type="button"
                id="timeTypeMonth"
                className={`detail-trend-toggle flex-1 rounded-md px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors ${timeType === 'month' ? 'active' : ''}`}
                onClick={() => {
                  if (timeType === 'month') return;
                  onTimeTypeChange('month');
                  onTimeValueChange(computeInitialTimeValue('month', meta, timeValue));
                  onTimeCommit();
                }}
              >
                {t('insight.byMonth')}
              </button>
              <button
                type="button"
                id="timeTypeYear"
                className={`detail-trend-toggle flex-1 rounded-md px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors ${timeType === 'year' ? 'active' : ''}`}
                onClick={() => {
                  if (timeType === 'year') return;
                  onTimeTypeChange('year');
                  onTimeValueChange(computeInitialTimeValue('year', meta, timeValue));
                  onTimeCommit();
                }}
              >
                {t('insight.byYear')}
              </button>
            </div>
          </div>
          <div id="timeRangeContainer">
            <TimeRangePicker
              meta={meta}
              timeType={timeType}
              timeValue={timeValue}
              lang={lang}
              t={t}
              onValueChange={onTimeValueChange}
              onCommit={onTimeCommit}
              onOpenChange={setTimePickerOpen}
            />
          </div>
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Icon icon="mdi:magnify" />
              <span>{t('insight.search')}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="openLeaderboardSearchInput"
                placeholder={t('insight.searchPlaceholder')}
                value={searchKeyword}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 pr-9 text-sm text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 placeholder:text-muted-foreground hover:border-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                id="searchClearBtn"
                title={t('insight.clearSearch')}
                aria-label={t('insight.clearSearch')}
                onClick={onSearchClear}
                className={`absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${searchKeyword.trim() ? '' : 'hidden'}`}
              >
                <Icon icon="mdi:close" className="text-base" />
              </button>
            </div>
          </div>
          <div id="paginationSection">{paginationSlot}</div>
        </div>
      </div>
    </div>
  );
}
