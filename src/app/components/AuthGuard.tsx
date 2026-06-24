import { Navigate, useLocation, Outlet } from 'react-router';
import { useCurrentUserQuery } from '../api';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();
  const { data: currentUser, isLoading } = useCurrentUserQuery();
  const token = localStorage.getItem('auth_token');

  // Nếu không có token cục bộ, điều hướng ngay về trang đăng nhập
  if (!token) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Hiển thị trạng thái tải thông tin người dùng từ máy chủ
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
            Đang xác minh thông tin tài khoản...
          </p>
        </div>
      </div>
    );
  }

  // Nếu có token nhưng không lấy được thông tin người dùng (token giả/hết hạn), điều hướng về login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
