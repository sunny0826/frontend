import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
import { Logo } from '@/app/components/logo';
import api from '@/lib/api';
import {
  User,
  Wallet,
  HandCoins,
  ShoppingBag,
  MessageSquare,
  Building2,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Radar,
} from 'lucide-react';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ReactNode;
  children?: { labelKey: string; path: string }[];
}

const navItems: NavItem[] = [
  { labelKey: 'nav.insight', path: '/insight', icon: <BarChart3 className="size-4" strokeWidth={1.5} /> },
  { labelKey: 'nav.profile', path: '/profile', icon: <User className="size-4" strokeWidth={1.5} /> },
  { labelKey: 'nav.points', path: '/points', icon: <Wallet className="size-4" strokeWidth={1.5} /> },
  { labelKey: 'nav.pointsAllocate', path: '/points/allocate', icon: <HandCoins className="size-4" strokeWidth={1.5} /> },
  { labelKey: 'nav.shop', path: '/shop', icon: <ShoppingBag className="size-4" strokeWidth={1.5} /> },
  { labelKey: 'nav.organizations', path: '/organizations', icon: <Building2 className="size-4" strokeWidth={1.5} /> },
  { labelKey: 'nav.messages', path: '/messages', icon: <MessageSquare className="size-4" strokeWidth={1.5} /> },
  { labelKey: 'nav.talentReach', path: '/talent-reach', icon: <Radar className="size-4" strokeWidth={1.5} /> },
  {
    labelKey: 'nav.settings',
    path: '/settings',
    icon: <Settings className="size-4" strokeWidth={1.5} />,
    children: [
      { labelKey: 'nav.settingsGeneral', path: '/settings/general' },
      { labelKey: 'nav.settingsEmail', path: '/settings/email' },
      { labelKey: 'nav.settingsPassword', path: '/settings/password' },
      { labelKey: 'nav.settingsAddresses', path: '/settings/addresses' },
      { labelKey: 'nav.settingsWithdrawalAccounts', path: '/settings/withdrawal-accounts' },
      { labelKey: 'nav.settingsMerge', path: '/settings/merge' },
    ],
  },
];

export function AppLayout() {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith('/settings')
  );
  const [unreadCount, setUnreadCount] = useState(0);


  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const { data } = await api.get<{ count: number }>('/messages/unread-count');
        setUnreadCount(data.count ?? 0);
      } catch {
        // 静默失败
      }
    };

    fetchUnread(); // 初始加载

    // 在消息页面 20 秒一次，其他页面 2 分钟一次
    const isMessagesPage = location.pathname === '/messages';
    const pollInterval = isMessagesPage ? 20000 : 120000;

    // 定时轮询
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    }, pollInterval);

    // 页面可见性变化时处理
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUnread();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 保留已有的自定义事件监听
    const handleUnreadChanged = (event: Event) => {
      const custom = event as CustomEvent<{ count: number }>;
      if (typeof custom.detail?.count === 'number') {
        setUnreadCount(custom.detail.count);
      } else {
        fetchUnread();
      }
    };
    window.addEventListener('messages:unread-changed', handleUnreadChanged);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('messages:unread-changed', handleUnreadChanged);
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/settings') return location.pathname.startsWith('/settings');
    const matched =
      location.pathname === path || location.pathname.startsWith(path + '/');
    if (!matched) return false;
    // 若存在更精确的兄弟导航项命中当前路径，则当前项不高亮，避免父子同时高亮
    const hasMoreSpecific = navItems.some(
      (it) =>
        it.path !== path &&
        it.path.startsWith(path + '/') &&
        (location.pathname === it.path ||
          location.pathname.startsWith(it.path + '/'))
    );
    return !hasMoreSpecific;
  };

  const navItemClass = (active: boolean) =>
    `group relative flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border px-2.5 py-2 text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
      active
        ? 'border-sidebar-primary/35 bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
        : 'border-transparent text-sidebar-foreground/70 hover:border-sidebar-border/70 hover:bg-sidebar-accent/55 hover:text-sidebar-foreground'
    }`;

  const navIconClass = (active: boolean) =>
    `flex size-7 shrink-0 items-center justify-center rounded-lg transition-[background-color,color] duration-150 ${
      active
        ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
        : 'bg-sidebar-accent/45 text-sidebar-foreground/70 group-hover:bg-sidebar-accent group-hover:text-sidebar-foreground'
    }`;

  const childNavItemClass = (active: boolean) =>
    `flex min-h-9 items-center rounded-lg border px-3 py-2 text-sm outline-none transition-[background-color,border-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-sidebar-ring ${
      active
        ? 'border-sidebar-primary/30 bg-sidebar-accent/75 font-medium text-sidebar-accent-foreground'
        : 'border-transparent text-sidebar-foreground/60 hover:border-sidebar-border/60 hover:bg-sidebar-accent/45 hover:text-sidebar-foreground'
    }`;

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="border-b border-sidebar-border/70 px-3 py-4">
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex min-w-0 items-center gap-3 rounded-xl bg-sidebar px-3 py-3 outline-none transition-[background-color,box-shadow] duration-150 hover:bg-sidebar-accent/45 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sidebar">
            <Logo className="size-8 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-semibold leading-tight">
              <span className="text-chart-2">Open</span>
              <span className="text-primary">Share</span>
            </span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="dark-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label={t('header.menu')}>
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                {item.children ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setSettingsOpen(!settingsOpen)}
                      className={navItemClass(active)}
                      aria-expanded={settingsOpen}
                      aria-controls="settings-navigation"
                    >
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <span className={navIconClass(active)}>{item.icon}</span>
                        <span className="truncate">{t(item.labelKey)}</span>
                      </span>
                      {settingsOpen ? (
                        <ChevronDown className="size-4 shrink-0 text-sidebar-foreground/60" strokeWidth={1.5} />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-sidebar-foreground/60" strokeWidth={1.5} />
                      )}
                    </button>
                    {settingsOpen && (
                      <ul id="settings-navigation" className="mt-1.5 space-y-1 rounded-xl border border-sidebar-border/60 bg-sidebar-accent/20 p-1.5">
                        {item.children.map((child) => (
                          <li key={child.path}>
                            <Link
                              to={child.path}
                              onClick={() => setSidebarOpen(false)}
                              className={childNavItemClass(location.pathname === child.path)}
                            >
                              {t(child.labelKey)}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={navItemClass(active)}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      <span className={navIconClass(active)}>{item.icon}</span>
                      <span className="truncate">{t(item.labelKey)}</span>
                    </span>
                    {item.path === '/messages' && unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full border border-destructive/30 bg-destructive/15 px-1.5 text-xs font-semibold tabular-nums text-destructive">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border/70 px-3 py-3">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex min-h-11 w-full items-center gap-3 rounded-xl border border-transparent px-2.5 py-2 text-sm font-medium text-destructive outline-none transition-[background-color,border-color,color] duration-150 hover:border-destructive/30 hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/30"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors group-hover:bg-destructive/15">
            <LogOut className="size-4" strokeWidth={1.5} />
          </span>
          <span className="truncate">{t('nav.logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-sidebar-border lg:bg-sidebar lg:shadow-sm">
        {SidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-foreground/70"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar shadow-xl">
            {SidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar (mobile only - menu trigger) */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex size-11 items-center justify-center rounded-lg text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={t('header.openMenu')}
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-secondary/55 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo className="size-7" />
            <span className="text-[15px] font-semibold leading-none">
              <span className="text-chart-2">Open</span>
              <span className="text-primary">Share</span>
            </span>
          </Link>
          <span className="size-11" aria-hidden="true" />
        </header>

        {/* Page Content */}
        <main className="dark-scrollbar flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
