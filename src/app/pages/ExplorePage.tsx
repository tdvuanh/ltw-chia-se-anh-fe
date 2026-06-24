import { useState } from 'react';
import { Link } from 'react-router';
import { PhotoCard } from '../components/PhotoCard';
import { TrendingUp, Award, Eye, Sparkles, Loader2 } from 'lucide-react';
import { useExplorePhotosQuery, useToggleLikeMutation } from '../api';

type ExploreTab = 'trending' | 'fresh' | 'top' | 'editors';

const TABS: { key: ExploreTab; label: string; icon: any }[] = [
  { key: 'trending', label: 'Xu Hướng', icon: TrendingUp },
  { key: 'fresh', label: 'Mới Nhất', icon: Sparkles },
  { key: 'top', label: 'Hàng Đầu', icon: Award },
  { key: 'editors', label: 'Lượt Xem Cao', icon: Eye },
];

const CATEGORIES = [
  { name: 'Thiên Nhiên', color: 'from-green-500 to-emerald-600' },
  { name: 'Phong Cảnh', color: 'from-blue-500 to-cyan-600' },
  { name: 'Động Vật', color: 'from-orange-500 to-amber-600' },
  { name: 'Thành Phố', color: 'from-purple-500 to-pink-600' },
  { name: 'Chân Dung', color: 'from-rose-500 to-red-600' },
  { name: 'Đường Phố', color: 'from-indigo-500 to-violet-600' },
];

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<ExploreTab>('trending');
  const { photos, isLoading } = useExplorePhotosQuery(activeTab);
  const { toggleLike } = useToggleLikeMutation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Khám Phá</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Khám phá những bức ảnh tuyệt vời từ cộng đồng nhiếp ảnh
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 border-b dark:border-gray-800 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Featured Categories -> liên kết tới tìm kiếm thật */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Danh Mục Nổi Bật</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                to={`/search?q=${encodeURIComponent(category.name)}`}
                className="group relative aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`}></div>
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                <div className="relative h-full flex flex-col items-center justify-center text-white">
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <p className="text-sm opacity-90">Tìm kiếm</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Photo Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                id={String(photo.id)}
                imageUrl={photo.imageUrl || photo.image_url || ''}
                title={photo.title}
                description={photo.description}
                username={photo.username || ''}
                userAvatar={photo.userAvatar}
                userId={photo.userId}
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
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">Chưa có bức ảnh nào để hiển thị.</p>
          </div>
        )}
      </div>
    </div>
  );
}
