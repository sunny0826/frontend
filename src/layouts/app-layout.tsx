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
} from 'lucide-react';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ReactNode;
  children?: { labelKey: string; path: string }[];
}

const navItems: NavItem[] = [
  { labelKey: 'nav.insight', path: '/insight', icon: <BarChart3 className="h-5 w-5" /> },
  { labelKey: 'nav.profile', path: '/profile', icon: <User className="h-5 w-5" /> },
  { labelKey: 'nav.points', path: '/points', icon: <Wallet className="h-5 w-5" /> },
  { labelKey: 'nav.pointsAllocate', path: '/points/allocate', icon: <HandCoins className="h-5 w-5" /> },
  { labelKey: 'nav.shop', path: '/shop', icon: <ShoppingBag className="h-5 w-5" /> },
  { labelKey: 'nav.organizations', path: '/organizations', icon: <Building2 className="h-5 w-5" /> },
  { labelKey: 'nav.messages', path: '/messages', icon: <MessageSquare className="h-5 w-5" /> },
  {
    labelKey: 'nav.settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />,
    children: [
      { labelKey: 'nav.settingsEmail', path: '/settings/email' },
      { labelKey: 'nav.settingsPassword', path: '/settings/password' },
      { labelKey: 'nav.settingsAddresses', path: '/settings/addresses' },
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

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <Link
          to="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2 transition-colors hover:opacity-80"
        >
          <Logo className="h-8 w-8" />
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
            OpenTalent
          </span>
        </Link>
        <div className="scale-[0.82] origin-right">
          <LanguageToggle />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => setSettingsOpen(!settingsOpen)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {t(item.labelKey)}
                    </span>
                    {settingsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {settingsOpen && (
                    <ul className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`block rounded-lg px-3 py-2 text-sm transition-all ${
                              location.pathname === child.path
                                ? 'bg-primary/10 text-primary font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50'
                            }`}
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/50'
                  }`}
                >
                  {item.icon}
                  {t(item.labelKey)}
                  {item.path === '/messages' && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs text-white">
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
      <div className="border-t px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-white/80 lg:backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar (mobile only - menu trigger) */}
        <header className="flex h-16 items-center border-b bg-white/80 backdrop-blur-xl px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
