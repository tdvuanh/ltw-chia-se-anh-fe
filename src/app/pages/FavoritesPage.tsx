import { PhotoCard } from '../components/PhotoCard';
import { Heart, Loader2 } from 'lucide-react';
import { useFavoritePhotosQuery, useToggleLikeMutation } from '../api';

export default function FavoritesPage() {
  const { data: photos = [], isLoading } = useFavoritePhotosQuery();
  const { toggleLike } = useToggleLikeMutation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-current" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Ảnh Yêu Thích</h1>
              <p className="text-gray-600 dark:text-gray-400">{photos.length} ảnh đã thích</p>
            </div>
          </div>
        </div>

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
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Chưa có ảnh yêu thích
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Nhấn vào biểu tượng trái tim trên một bức ảnh để lưu vào đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
