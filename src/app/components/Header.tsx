import { Link, useNavigate } from 'react-router';
import { Search, Upload, Home, Compass, Bell, Heart } from 'lucide-react';
import { useState } from 'react';
import { AccountDropdown } from './AccountDropdown';
import { useCurrentUserQuery, useUnreadCountQuery } from '../api';

export function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Lấy thông tin user hiện tại từ React Query
  const { data: currentUser, isLoading } = useCurrentUserQuery();

  // Số thông báo chưa đọc (chỉ truy vấn khi đã đăng nhập, tự refetch mỗi 30s)
  const { data: unreadCount = 0 } = useUnreadCountQuery(!!currentUser);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" prefetch="intent" className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg"></div>
            Chia Sẻ Ảnh
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm ảnh, thẻ hoặc người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </form>

          <nav className="flex items-center gap-1">
            <Link
              to="/"
              prefetch="intent"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Trang chủ"
            >
              <Home className="w-5 h-5" />
            </Link>
            <Link
              to="/explore"
              prefetch="intent"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Khám phá"
            >
              <Compass className="w-5 h-5" />
            </Link>
            <Link
              to="/favorites"
              prefetch="intent"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Yêu thích"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <Link
              to="/upload"
              prefetch="intent"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Đăng ảnh"
            >
              <Upload className="w-5 h-5" />
            </Link>
            <Link
              to="/notifications"
              prefetch="intent"
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
              title="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {currentUser && unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse ml-2"></div>
            ) : currentUser ? (
              <AccountDropdown />
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link
                  to="/login"
                  prefetch="intent"
                  className="px-3.5 py-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  prefetch="intent"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-sm"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
