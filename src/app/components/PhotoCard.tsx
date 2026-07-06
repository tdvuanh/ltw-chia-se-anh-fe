import { Link } from 'react-router';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useCurrentUserQuery } from '../api';
import { useAuthModal } from '../contexts/AuthModalContext';
import { toast } from 'sonner';

interface PhotoCardProps {
  key?: string | number;
  id: string;
  imageUrl: string;
  title: string;
  description?: string;
  username: string;
  userAvatar?: string;
  likes: number;
  comments: number;
  views: number;
  tags?: string[];
  isLiked?: boolean;
  userId?: string | number;
  status?: 'pending' | 'approved' | 'rejected';
  onLike?: () => void;
}

export function PhotoCard({
  id,
  imageUrl,
  title,
  description,
  username,
  userAvatar,
  likes,
  comments,
  views,
  tags,
  isLiked = false,
  userId,
  status,
  onLike,
}: PhotoCardProps) {
  const { data: currentUser } = useCurrentUserQuery();
  const { openLoginModal } = useAuthModal();

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700 hover:shadow-lg transition-shadow">
      <Link to={`/photo/${id}`} className="block aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
        {status === 'pending' && (
          <span className="absolute top-2 right-2 z-10 px-2.5 py-1 bg-amber-500 text-white text-xs font-bold rounded-full shadow-md">
            Đợi duyệt
          </span>
        )}
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-4">
        <Link to={`/photo/${id}`} className="block">
          <h3 className="font-semibold mb-1 line-clamp-1 hover:text-purple-600 dark:hover:text-purple-400 text-gray-900 dark:text-white">{title}</h3>
          {description && <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{description}</p>}
        </Link>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
                className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-700 dark:text-gray-300"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link to={`/profile/${username}/${userId}`} className="flex items-center gap-2 hover:opacity-80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold">
              {username[0].toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{username}</span>
          </Link>

          <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={(e) => {
                e.preventDefault();
                if (!currentUser) {
                  toast.error('Yêu cầu đăng nhập', {
                    description: 'Vui lòng đăng nhập để thích bức ảnh này.',
                  });
                  openLoginModal();
                  return;
                }
                onLike?.();
              }}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likes}</span>
            </button>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{views}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
