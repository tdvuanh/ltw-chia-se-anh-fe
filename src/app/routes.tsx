import { createBrowserRouter } from 'react-router';
import RootLayout from './layouts/RootLayout';
import AuthGuard from './components/AuthGuard';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () => import('./pages/HomePage').then(m => ({ Component: m.default }))
      },
      {
        path: 'explore',
        lazy: () => import('./pages/ExplorePage').then(m => ({ Component: m.default }))
      },
      {
        path: 'search',
        lazy: () => import('./pages/SearchPage').then(m => ({ Component: m.default }))
      },
      {
        path: 'photo/:id',
        lazy: () => import('./pages/PhotoDetailPage').then(m => ({ Component: m.default }))
      },
      {
        path: 'profile/:username/:id',
        lazy: () => import('./pages/ProfilePage').then(m => ({ Component: m.default }))
      },

      // Nhóm các tuyến đường cần đăng nhập để truy cập (được bảo vệ bởi AuthGuard)
      {
        Component: AuthGuard,
        children: [
          {
            path: 'favorites',
            lazy: () => import('./pages/FavoritesPage').then(m => ({ Component: m.default }))
          },
          {
            path: 'albums',
            lazy: () => import('./pages/AlbumsPage').then(m => ({ Component: m.default }))
          },
          {
            path: 'notifications',
            lazy: () => import('./pages/NotificationsPage').then(m => ({ Component: m.default }))
          },
          {
            path: 'settings',
            lazy: () => import('./pages/AccountSettingsPage').then(m => ({ Component: m.default }))
          },
          {
            path: 'upload',
            lazy: () => import('./pages/UploadPage').then(m => ({ Component: m.default }))
          },
          {
            path: 'admin',
            lazy: () => import('./pages/AdminPage').then(m => ({ Component: m.default }))
          },
        ],
      },
    ],
  },
  // Các tuyến đường Xác thực được dựng độc lập không bọc Header của RootLayout
  {
    path: 'login',
    lazy: () => import('./pages/auth/LoginPage').then(m => ({ Component: m.default }))
  },
  {
    path: 'register',
    lazy: () => import('./pages/auth/RegisterPage').then(m => ({ Component: m.default }))
  },
  {
    path: 'forgot-password',
    lazy: () => import('./pages/auth/ForgotPasswordPage').then(m => ({ Component: m.default }))
  },
  {
    path: 'reset-password',
    lazy: () => import('./pages/auth/ResetPasswordPage').then(m => ({ Component: m.default }))
  },
  {
    path: 'verify-email',
    lazy: () => import('./pages/auth/VerifyEmailPage').then(m => ({ Component: m.default }))
  },
]);

