import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { AuthLayout } from '@/layouts/auth-layout';
import { AppLayout } from '@/layouts/app-layout';

// Landing page
import App from '@/app/App';

// Public pages
import LoginPage from '@/pages/login';
import SignupPage from '@/pages/signup';
import PasswordResetPage from '@/pages/password-reset';
import PasswordResetConfirmPage from '@/pages/password-reset-confirm';
import SocialCallbackPage from '@/pages/social-callback';
import PublicProfilePage from '@/pages/public-profile';

// Authenticated pages
import ProfilePage from '@/pages/profile';
import ProfileEditPage from '@/pages/profile-edit';
import PointsPage from '@/pages/points';
import TransactionsPage from '@/pages/transactions';
import WithdrawalsPage from '@/pages/withdrawals';
import ShopPage from '@/pages/shop';
import ShopItemPage from '@/pages/shop-item';
import RedemptionsPage from '@/pages/redemptions';
import MessagesPage from '@/pages/messages';
import OrganizationsPage from '@/pages/organizations';
import OrganizationCreatePage from '@/pages/organization-create';
import OrganizationDetailPage from '@/pages/organization-detail';
import OrganizationMembersPage from '@/pages/organization-members';
import OrganizationSettingsPage from '@/pages/organization-settings';
import OrganizationTransactionsPage from '@/pages/organization-transactions';
import ChangeEmailPage from '@/pages/change-email';
import ChangePasswordPage from '@/pages/change-password';
import AddressesPage from '@/pages/addresses';
import AccountMergePage from '@/pages/account-merge';
import PointAllocationPage from '@/pages/point-allocation';
import TalentReachPage from '@/pages/talent-reach';
import InsightPage from '../pages/insight/index';
import InsightDispatcher from '../pages/insight/insight-dispatcher';
// Register MDI offline icon collection used across insight pages.
// This import has side effects only (calls addCollection on @iconify/react/offline).
import '../pages/insight/icons/registerMdiOffline';

// Root layout with AuthProvider
function RootLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Landing page
      { path: '/', element: <App /> },

      // Public profile
      { path: '/u/:username', element: <PublicProfilePage /> },

      // Social login callback
      { path: '/social-callback', element: <SocialCallbackPage /> },

      // Auth pages (with AuthLayout)
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/signup', element: <SignupPage /> },
          { path: '/password-reset', element: <PasswordResetPage /> },
          { path: '/password-reset/confirm', element: <PasswordResetConfirmPage /> },
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
          { path: '/profile', element: <ProfilePage /> },
          { path: '/profile/edit', element: <ProfileEditPage /> },
          { path: '/points', element: <PointsPage /> },
          { path: '/points/transactions', element: <TransactionsPage /> },
          { path: '/points/withdrawals', element: <WithdrawalsPage /> },
                    { path: '/points/allocate', element: <PointAllocationPage /> },
          { path: '/shop', element: <ShopPage /> },
          { path: '/shop/:id', element: <ShopItemPage /> },
          { path: '/redemptions', element: <RedemptionsPage /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/talent-reach', element: <TalentReachPage /> },
          { path: '/organizations', element: <OrganizationsPage /> },
          { path: '/organizations/create', element: <OrganizationCreatePage /> },
          { path: '/organizations/:slug', element: <OrganizationDetailPage /> },
          { path: '/organizations/:slug/members', element: <OrganizationMembersPage /> },
          { path: '/organizations/:slug/settings', element: <OrganizationSettingsPage /> },
          { path: '/organizations/:slug/transactions', element: <OrganizationTransactionsPage /> },
          { path: '/insight', element: <InsightPage /> },
          { path: '/insight/*', element: <InsightDispatcher /> },
          { path: '/settings/email', element: <ChangeEmailPage /> },
          { path: '/settings/password', element: <ChangePasswordPage /> },
          { path: '/settings/addresses', element: <AddressesPage /> },
          { path: '/settings/merge', element: <AccountMergePage /> },
        ],
      },
    ],
  },
]);
