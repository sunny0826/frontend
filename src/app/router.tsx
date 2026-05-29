import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthLayout } from '@/layouts/auth-layout';
import { AppLayout } from '@/layouts/app-layout';

// Landing page
import App from '@/app/App';

// Public pages
const LoginPage = lazy(() => import('@/pages/login'));
const SocialCallbackPage = lazy(() => import('@/pages/social-callback'));
const PublicProfilePage = lazy(() => import('@/pages/public-profile'));

// Authenticated pages
const ProfilePage = lazy(() => import('@/pages/profile'));
const ProfileEditPage = lazy(() => import('@/pages/profile-edit'));
const PointsPage = lazy(() => import('@/pages/points'));
const TransactionsPage = lazy(() => import('@/pages/transactions'));
const WithdrawalsPage = lazy(() => import('@/pages/withdrawals'));
const ShopPage = lazy(() => import('@/pages/shop'));
const ShopItemPage = lazy(() => import('@/pages/shop-item'));
const RedemptionsPage = lazy(() => import('@/pages/redemptions'));
const MessagesPage = lazy(() => import('@/pages/messages'));
const OrganizationsPage = lazy(() => import('@/pages/organizations'));
const OrganizationCreatePage = lazy(() => import('@/pages/organization-create'));
const OrganizationDetailPage = lazy(() => import('@/pages/organization-detail'));
const OrganizationMembersPage = lazy(() => import('@/pages/organization-members'));
const OrganizationSettingsPage = lazy(() => import('@/pages/organization-settings'));
const OrganizationTransactionsPage = lazy(() => import('@/pages/organization-transactions'));
const SettingsGeneralPage = lazy(() => import('@/pages/settings-general'));
const AddressesPage = lazy(() => import('@/pages/addresses'));
const WithdrawalAccountsPage = lazy(() => import('@/pages/withdrawal-accounts'));
const AccountMergePage = lazy(() => import('@/pages/account-merge'));
const PointAllocationPage = lazy(() => import('@/pages/point-allocation'));
const TalentReachPage = lazy(() => import('@/pages/talent-reach'));
const InsightPage = lazy(() => import('../pages/insight/index'));
const InsightDispatcher = lazy(() => import('../pages/insight/insight-dispatcher'));

// Root layout with AuthProvider
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background text-sm text-muted-foreground">
      Loading...
    </div>
  );
}

function lazyElement(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Landing page
      { path: '/', element: <App /> },

      // Public profile
      { path: '/u/:username', element: lazyElement(<PublicProfilePage />) },

      // Social login callback
      { path: '/social-callback', element: lazyElement(<SocialCallbackPage />) },

      // Auth pages (with AuthLayout)
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: lazyElement(<LoginPage />) },
        ],
      },

      // Protected pages (with AppLayout)
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: '/profile', element: lazyElement(<ProfilePage />) },
          { path: '/profile/edit', element: lazyElement(<ProfileEditPage />) },
          { path: '/points', element: lazyElement(<PointsPage />) },
          { path: '/points/transactions', element: lazyElement(<TransactionsPage />) },
          { path: '/points/withdrawals', element: lazyElement(<WithdrawalsPage />) },
          { path: '/points/allocate', element: lazyElement(<PointAllocationPage />) },
          { path: '/shop', element: lazyElement(<ShopPage />) },
          { path: '/shop/:id', element: lazyElement(<ShopItemPage />) },
          { path: '/redemptions', element: lazyElement(<RedemptionsPage />) },
          { path: '/messages', element: lazyElement(<MessagesPage />) },
          { path: '/talent-reach', element: lazyElement(<TalentReachPage />) },
          { path: '/organizations', element: lazyElement(<OrganizationsPage />) },
          { path: '/organizations/create', element: lazyElement(<OrganizationCreatePage />) },
          { path: '/organizations/:slug', element: lazyElement(<OrganizationDetailPage />) },
          { path: '/organizations/:slug/members', element: lazyElement(<OrganizationMembersPage />) },
          { path: '/organizations/:slug/settings', element: lazyElement(<OrganizationSettingsPage />) },
          { path: '/organizations/:slug/transactions', element: lazyElement(<OrganizationTransactionsPage />) },
          { path: '/insight', element: lazyElement(<InsightPage />) },
          { path: '/insight/*', element: lazyElement(<InsightDispatcher />) },
          { path: '/settings/general', element: lazyElement(<SettingsGeneralPage />) },
          { path: '/settings/addresses', element: lazyElement(<AddressesPage />) },
          { path: '/settings/withdrawal-accounts', element: lazyElement(<WithdrawalAccountsPage />) },
          { path: '/settings/merge', element: lazyElement(<AccountMergePage />) },
        ],
      },
    ],
  },
]);
