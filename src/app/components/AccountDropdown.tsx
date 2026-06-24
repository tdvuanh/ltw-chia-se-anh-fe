import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { User, Settings, Shield, Moon, Sun, LogOut, Bell, Heart, Folder } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrentUserQuery, useLogoutMutation } from '../api';
import { useAuthStore } from '../store/useAuthStore';

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((state) => state.user);

  // 1. Lấy thông tin user và mutation đăng xuất từ React Query
  const { data: currentUser } = useCurrentUserQuery();
  const { mutate: logout } = useLogoutMutation();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const displayName = currentUser?.full_name || currentUser?.displayName || currentUser?.username || 'Thành viên';
  const email = currentUser?.email || 'Chưa cập nhật email';
  const avatarUrl = currentUser?.avatar_url || currentUser?.avatarUrl;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors cursor-pointer"
        title="Tài khoản"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold overflow-hidden shadow-sm border border-purple-200 dark:border-purple-900">
          {avatarUrl ? (
            <img src={avatarUrl} alt={currentUser?.username} className="w-full h-full object-cover" />
          ) : (
            displayName.substring(0, 1).toUpperCase()
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              to={user ? `/profile/${user.username}/${user.id}` : '/login'}
              prefetch="intent"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4.5 h-4.5 text-gray-400" />
              <span>Trang Cá Nhân</span>
            </Link>

            <Link
              to="/favorites"
              prefetch="intent"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-4.5 h-4.5 text-gray-400" />
              <span>Yêu Thích</span>
            </Link>

            <Link
              to="/albums"
              prefetch="intent"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Folder className="w-4.5 h-4.5 text-gray-400" />
              <span>Album</span>
            </Link>

            <Link
              to="/notifications"
              prefetch="intent"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Bell className="w-4.5 h-4.5 text-gray-400" />
              <span>Thông Báo</span>
            </Link>

            {isAdmin && (
              <>
                <div className="border-t dark:border-gray-700 my-1"></div>
                <Link
                  to="/admin"
                  prefetch="intent"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 text-sm font-semibold transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4.5 h-4.5" />
                  <span>Bảng Điều Khiển Admin</span>
                </Link>
              </>
            )}

            <div className="border-t dark:border-gray-700 my-1"></div>

            <Link
              to="/settings"
              prefetch="intent"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4.5 h-4.5 text-gray-400" />
              <span>Cài Đặt Tài Khoản</span>
            </Link>

            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm font-medium">
                {theme === 'dark' ? <Moon className="w-4.5 h-4.5 text-gray-400" /> : <Sun className="w-4.5 h-4.5 text-gray-400" />}
                <span>Chế Độ Tối</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="border-t dark:border-gray-700 my-1"></div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-sm font-semibold transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
