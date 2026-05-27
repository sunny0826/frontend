import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/auth-context';
import { Logo } from '@/app/components/logo';
import { LanguageToggle } from '@/app/components/language-toggle';
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
    `group relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium outline-none transition-[background-color,border-color,color,box-shadow] duration-150 focus-visible:ring-2 focus-visible:ring-ring ${
      active
        ? 'border border-primary/30 bg-primary/10 text-primary shadow-sm before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:rounded-full before:bg-primary'
        : 'border border-transparent text-muted-foreground hover:border-border hover:bg-secondary/55 hover:text-foreground'
    }`;

  const childNavItemClass = (active: boolean) =>
    `block rounded-lg border px-3 py-2 text-sm outline-none transition-[background-color,border-color,color] duration-150 focus-visible:ring-2 focus-visible:ring-ring ${
      active
        ? 'border-primary/25 bg-primary/10 font-medium text-primary'
        : 'border-transparent text-muted-foreground hover:border-border hover:bg-secondary/55 hover:text-foreground'
    }`;

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-border px-3 pl-4">
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-secondary/55 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo className="size-7" />
          <span className="text-[15px] font-semibold leading-none">
            <span className="text-sky-400">Open</span>
            <span className="text-primary">Share</span>
          </span>
        </Link>
        <LanguageToggle iconOnly />
      </div>

      {/* Navigation */}
      <nav className="dark-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label={t('nav.settings')}>
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={navItemClass(isActive(item.path))}
                    aria-expanded={settingsOpen}
                    aria-controls="settings-navigation"
                  >
                    <span className="flex min-w-0 items-center gap-3 pl-1">
                      {item.icon}
                      <span className="truncate">{t(item.labelKey)}</span>
                    </span>
                    {settingsOpen ? (
                      <ChevronDown className="size-4" strokeWidth={1.5} />
                    ) : (
                      <ChevronRight className="size-4" strokeWidth={1.5} />
                    )}
                  </button>
                  {settingsOpen && (
                    <ul id="settings-navigation" className="ml-7 mt-1 space-y-1 border-l border-border/70 pl-2">
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
                  className={navItemClass(isActive(item.path))}
                >
                  <span className="pl-1">{item.icon}</span>
                  <span className="truncate">{t(item.labelKey)}</span>
                  {item.path === '/messages' && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full border border-destructive/30 bg-destructive/15 px-1.5 text-xs font-semibold text-destructive">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-border px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex min-h-11 w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-destructive outline-none transition-[background-color,border-color,color] duration-150 hover:border-destructive/30 hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive/30"
        >
          <LogOut className="size-4" strokeWidth={1.5} />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-dvh bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border lg:bg-card/95 lg:shadow-[inset_0_1px_0_rgba(226,232,240,0.08)]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar (mobile only - menu trigger) */}
        <header className="flex h-16 items-center border-b border-border bg-card/95 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-foreground outline-none transition-colors hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Open navigation"
          >
            <Menu className="size-5" strokeWidth={1.5} />
          </button>
        </header>

        {/* Page Content */}
        <main className="dark-scrollbar flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
