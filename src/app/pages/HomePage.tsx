import { useState } from 'react';
import { PhotoCard } from '../components/PhotoCard';
import { TrendingUp, Clock } from 'lucide-react';
import { usePhotosQuery, useToggleLikeMutation } from '../api';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'latest' | 'popular'>('latest');

  // 1. Sử dụng Custom Hooks tối ưu cấu trúc dữ liệu (Đã tự động cache, mapping và sort)
  const { photos: displayPhotos, isLoading, error, refetch } = usePhotosQuery(activeTab);
  const { toggleLike } = useToggleLikeMutation();

  // 2. Xử lý trạng thái Loading (Skeleton Grid cao cấp)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <div className="container mx-auto max-w-[1400px] px-4 py-8">
          <div className="mb-8 animate-pulse">
            <div className="h-9 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="flex gap-2 mb-6 border-b dark:border-gray-800">
            <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700 p-4 space-y-4 animate-pulse"
              >
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Xử lý trạng thái Lỗi kết nối (Error UI chuyên nghiệp có nút Retry)
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Đã xảy ra lỗi kết nối API</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error instanceof Error ? error.message : (error as any).message || 'Không thể tải được dữ liệu hình ảnh.'}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-md transition-all duration-200 cursor-pointer"
          >
            Thử lại kết nối
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Khám Phá Ảnh</h1>
          <p className="text-gray-600 dark:text-gray-400">Khám phá những bức ảnh mới nhất và phổ biến nhất từ cộng đồng</p>
        </div>

        <div className="flex gap-2 mb-6 border-b dark:border-gray-800">
          <button
            onClick={() => setActiveTab('latest')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'latest'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Mới Nhất
          </button>
          <button
            onClick={() => setActiveTab('popular')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'popular'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Phổ Biến
          </button>
        </div>

        {displayPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                id={String(photo.id)}
                imageUrl={photo.imageUrl || ''}
                title={photo.title}
                description={photo.description}
                username={photo.username || 'user'}
                userAvatar={photo.userAvatar}
                userId={photo.userId || photo.user?.id}
                likes={photo.likes}
                comments={photo.comments}
                views={photo.views}
                tags={photo.tags}
                isLiked={photo.isLiked}
                onLike={() => toggleLike(photo.id, !!photo.isLiked)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
            <p className="text-gray-500 dark:text-gray-400 text-lg">Chưa có bức ảnh nào được đăng tải trên hệ thống.</p>
          </div>
        )}
      </div>
    </div>
  );
}
