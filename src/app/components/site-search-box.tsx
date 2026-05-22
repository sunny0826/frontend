import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { RepoPlatformIcon } from '@/pages/insight/components/RepoPlatformIcon';
import { inferLabelAvatarUrl } from '@/pages/insight/domain/repoPlatform';
import { LABEL_TYPE_MAP } from '@/pages/insight/domain/labelTypes';

interface SearchResultItem {
  // For repo/user rows this is the source platform (github/gitee/...).
  // For label rows this carries the label type (Project / Company / ...).
  platform: string;
  // Numeric for repo/user, canonical ':companies/...'-style string for labels.
  id: number | string;
  name: string;
  name_zh?: string;
  type: string;
}

type Variant = 'landing' | 'insight';

interface SiteSearchBoxProps {
  /**
   * Visual variant.
   * - 'landing': plain input, no decorative glow (caller controls outer container).
   * - 'insight': self-contained block with subtle background glow and rounded-xl input.
   */
  variant?: Variant;
}

/**
 * Unified site-wide search box used on the landing hero section and the
 * insight (leaderboard) page. Renders an input with debounced /public/search
 * lookup and a two-column dropdown (Repositories | Developers) with type
 * labels in column headers.
 */
// Resolve a flatten_labels.type value (e.g. 'Project', 'Company',
// 'Division', 'Tech') to a localized display name from LABEL_TYPE_MAP.
// flatten_labels stores types without the '-0' suffix that LABEL_TYPE_MAP
// uses for division/tech/university/institution/agency, so try several
// candidate keys before falling back to the raw value.
function resolveLabelTypeDisplay(rawType: string, lang: 'zh' | 'en'): string {
  if (!rawType) return lang === 'zh' ? '标签' : 'Label';
  const cap = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
  const candidates = [rawType, `${rawType}-0`, cap, `${cap}-0`, rawType.toLowerCase()];
  for (const key of candidates) {
    const entry = LABEL_TYPE_MAP[key];
    if (entry) return lang === 'zh' ? entry.zh : entry.en;
  }
  return rawType;
}

export function SiteSearchBox({ variant = 'landing' }: SiteSearchBoxProps) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || 'en').startsWith('zh') ? 'zh' : 'en';
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Disable search on landing page until user is authenticated
  const isDisabled = variant === 'landing' && !authLoading && !isAuthenticated;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2 || isDisabled) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const timer = setTimeout(async () => {
      // Cancel previous in-flight request to avoid backend concurrency errors
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const { data } = await api.get<{ items: SearchResultItem[] }>(
          `/public/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal },
        );
        setSearchResults(
          data.items.filter((item) => {
            const typeLower = (item.type || '').toLowerCase();
            return typeLower === 'repo' || typeLower === 'user' || typeLower === 'label';
          }),
        );
        setShowResults(true);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'CanceledError') return;
        setSearchResults([]);
        setShowResults(true);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  function handleResultClick(item: SearchResultItem) {
    const itemType = (item.type || '').toLowerCase();
    if (itemType === 'repo') {
      const [owner, repo] = item.name.split('/');
      navigate(`/insight/${item.platform}/${owner}/${repo}`);
    } else if (itemType === 'label') {
      // flatten_labels.id is canonical ':companies/huawei/ascend'; the label
      // detail route expects the path without the leading ':' prefix.
      const labelPath = String(item.id || '').replace(/^[:#]/, '');
      navigate(`/insight/labels/${labelPath}`);
    } else {
      navigate(`/insight/${item.platform}/${item.name}`);
    }
    setShowResults(false);
    setSearchQuery('');
    setSearchResults([]);
  }

  const placeholderKey = isDisabled
    ? 'hero.search.placeholder.unauthenticated'
    : 'hero.search.placeholder';

  const inputClass =
    variant === 'insight'
      ? 'w-full h-12 pl-12 pr-4 rounded-xl border border-[#475569] bg-[#1E293B] focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E]/30 focus:outline-none text-[#E2E8F0] placeholder:text-[#64748B] shadow-lg shadow-black/20 transition-all duration-200'
      : `w-full h-12 pl-12 pr-4 rounded-lg border border-[#475569] bg-[#1E293B] focus:border-[#22C55E] focus:outline-none text-[#E2E8F0] placeholder:text-[#64748B]${isDisabled ? ' opacity-60 cursor-not-allowed' : ''}`;

  const repoResults = searchResults.filter(
    (item) => (item.type || '').toLowerCase() === 'repo',
  );
  const userResults = searchResults.filter(
    (item) => (item.type || '').toLowerCase() === 'user',
  );
  const labelResults = searchResults.filter(
    (item) => (item.type || '').toLowerCase() === 'label',
  );

  const getDisplayName = (item: SearchResultItem) =>
    lang === 'zh' && item.name_zh ? item.name_zh : item.name;

  const renderItem = (item: SearchResultItem) => (
    <div
      key={`${item.platform}-${item.type}-${item.id}`}
      className="flex items-center gap-1.5 px-2.5 py-1 cursor-pointer hover:bg-[#334155] transition-colors text-left"
      onClick={() => handleResultClick(item)}
    >
      <RepoPlatformIcon platform={item.platform} size="sm" />
      <span className="text-[#E2E8F0] truncate text-xs">{getDisplayName(item)}</span>
    </div>
  );

  // Label rows reuse the avatar construction from the label detail page so
  // the same OSS logo path (https://oss.open-digger.cn/logos/...) is shown.
  const renderLabelItem = (item: SearchResultItem) => {
    const rawLabelId = String(item.id || '');
    const avatarUrl = inferLabelAvatarUrl(rawLabelId);
    const rawType = item.platform || '';
    const typeDisplay = resolveLabelTypeDisplay(rawType, lang);
    return (
      <div
        key={`label-${rawLabelId}`}
        className="flex items-center gap-1.5 px-2.5 py-1 cursor-pointer hover:bg-[#334155] transition-colors text-left"
        onClick={() => handleResultClick(item)}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-4 h-4 rounded-sm object-contain bg-[#0F172A]"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <Tag className="w-3.5 h-3.5 text-[#94A3B8]" />
        )}
        <span className="text-[#E2E8F0] truncate text-xs flex-1 min-w-0">{getDisplayName(item)}</span>
        {typeDisplay && (
          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#334155] text-[#94A3B8] border border-[#475569]">
            {typeDisplay}
          </span>
        )}
      </div>
    );
  };

  const columnHeader = (label: string, count: number) => (
    <div className="sticky top-0 z-10 flex items-center justify-between px-2.5 py-1 bg-[#0F172A] border-b border-[#475569] text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
      <span>{label}</span>
      <span className="text-[#64748B]">{count}</span>
    </div>
  );

  const emptyCol = (
    <div className="px-2.5 py-2 text-xs text-[#64748B] text-left select-none">—</div>
  );

  const inputAndDropdown = (
    <div className="relative w-full" ref={searchContainerRef}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B] z-10" />
      <input
        type="text"
        value={searchQuery}
        disabled={isDisabled}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => {
          if (searchQuery.trim()) setShowResults(true);
        }}
        placeholder={t(placeholderKey)}
        className={inputClass}
      />

      {/* Search results dropdown */}
      {showResults && !isSearching && searchQuery.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[#475569] bg-[#1E293B] shadow-lg z-50 overflow-hidden">
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-3 divide-x divide-[#475569]">
              <div className="flex flex-col max-h-[220px] overflow-y-auto overscroll-contain">
                {columnHeader(t('hero.search.typeRepo'), repoResults.length)}
                {repoResults.length > 0 ? repoResults.map(renderItem) : emptyCol}
              </div>
              <div className="flex flex-col max-h-[220px] overflow-y-auto overscroll-contain">
                {columnHeader(t('hero.search.typeUser'), userResults.length)}
                {userResults.length > 0 ? userResults.map(renderItem) : emptyCol}
              </div>
              <div className="flex flex-col max-h-[220px] overflow-y-auto overscroll-contain">
                {columnHeader(t('hero.search.typeLabel'), labelResults.length)}
                {labelResults.length > 0 ? labelResults.map(renderLabelItem) : emptyCol}
              </div>
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-[#94A3B8] text-left select-none">
              {t('hero.search.noResults')}
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isSearching && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-[#475569] bg-[#1E293B] shadow-lg z-50 px-4 py-3 flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[#22C55E] animate-spin" />
          <span className="text-[#94A3B8] text-sm">Searching...</span>
        </div>
      )}
    </div>
  );

  if (variant === 'insight') {
    return (
      <div className="relative py-2 px-4">
        {/* Decorative background glow */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden
        >
          <div className="w-[500px] h-[120px] bg-[#22C55E]/5 rounded-full blur-3xl" />
        </div>
        <div
          className="absolute top-2 left-1/4 w-48 h-24 bg-[#3B82F6]/5 rounded-full blur-2xl pointer-events-none"
          aria-hidden
        />

        <div className="relative flex justify-center w-4/5 mx-auto">{inputAndDropdown}</div>
      </div>
    );
  }

  // landing variant — outer layout (centering / margins) is controlled by caller
  return inputAndDropdown;
}
