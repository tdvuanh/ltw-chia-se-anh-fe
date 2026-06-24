import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import { PhotoCard } from '../components/PhotoCard';
import { Search, Filter, Loader2, UserPlus, UserCheck } from 'lucide-react';
import {
  useSearchPhotosQuery,
  useSearchUsersQuery,
  useToggleLikeMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useCurrentUserQuery
} from '../api';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [filterBy, setFilterBy] = useState<'all' | 'photos' | 'users' | 'tags'>('all');

  // Sync state with URL search param
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  // Call API search hooks (only enabled if search query is non-empty)
  const { data: photos = [], isLoading: isLoadingPhotos } = useSearchPhotosQuery(query);
  const { data: users = [], isLoading: isLoadingUsers } = useSearchUsersQuery(query);
  
  // Custom API hooks for mutations & auth status
  const { toggleLike } = useToggleLikeMutation();
  const { mutate: followUser, isPending: isFollowPending } = useFollowUserMutation();
  const { mutate: unfollowUser, isPending: isUnfollowPending } = useUnfollowUserMutation();
  const { data: currentUser } = useCurrentUserQuery();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const handleFollowToggle = (userId: string | number, isFollowing: boolean) => {
    if (isFollowing) {
      unfollowUser(userId);
    } else {
      followUser(userId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Kết Quả Tìm Kiếm</h1>
          {query ? (
            <p className="text-gray-600 dark:text-gray-400">
              Tìm thấy {photos.length} ảnh và {users.length} người dùng cho "{query}"
            </p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">Nhập từ khóa bên dưới để bắt đầu tìm kiếm</p>
          )}
        </div>

        {/* Search & Filter Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm ảnh, thẻ hoặc người dùng..."
                  className="w-full pl-12 pr-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white cursor-pointer"
              >
                <option value="all">Tất Cả</option>
                <option value="photos">Chỉ Ảnh</option>
                <option value="users">Chỉ Người Dùng</option>
                <option value="tags">Chỉ Thẻ</option>
              </select>
            </div>
          </form>
        </div>

        {/* Loading Indicator */}
        {!query && (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm mb-12">
            <Search className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-bounce" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Bắt đầu khám phá</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Tìm kiếm các tác phẩm nghệ thuật, nhiếp ảnh gia tài năng hoặc các chủ đề ảnh thiên nhiên yêu thích của bạn.
            </p>
          </div>
        )}

        {/* Photos Section */}
        {query && (filterBy === 'all' || filterBy === 'photos') ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              Ảnh
              {isLoadingPhotos && <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />}
            </h2>

            {isLoadingPhotos ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border dark:border-gray-700 p-4 space-y-4 animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : photos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    id={String(photo.id)}
                    imageUrl={photo.imageUrl}
                    title={photo.title}
                    description={photo.description}
                    username={photo.username}
                    userAvatar={photo.userAvatar}
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
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">Không tìm thấy ảnh nào khớp với từ khóa của bạn.</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Users Section */}
        {query && (filterBy === 'all' || filterBy === 'users') ? (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              Người Dùng
              {isLoadingUsers && <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />}
            </h2>

            {isLoadingUsers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 animate-pulse space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => {
                  const isFollowing = !!user.isFollowing;
                  const isSelf = user.id === currentUser?.id;
                  
                  return (
                    <div key={user.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 hover:shadow-md transition-shadow flex flex-col justify-between">
                      <div className="flex items-center gap-4">
                        <Link to={`/profile/${user.username}/${user.id}`} className="hover:opacity-80 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold overflow-hidden shadow-sm">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.username} className="w-full h-full object-cover" />
                            ) : (
                              user.username[0].toUpperCase()
                            )}
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link to={`/profile/${user.username}/${user.id}`} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{user.displayName}</h3>
                          </Link>
                          <p className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {user.photosCount || 0} ảnh • {user.followersCount || 0} người theo dõi
                          </p>
                        </div>
                      </div>
                      
                      {!isSelf && (
                        <button
                          onClick={() => handleFollowToggle(user.id, isFollowing)}
                          disabled={isFollowPending || isUnfollowPending}
                          className={`w-full mt-4 py-2 rounded-lg transition-colors font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 ${
                            isFollowing
                              ? 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-900 dark:text-white'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <UserCheck className="w-4 h-4" />
                              Đang Theo Dõi
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              Theo Dõi
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
                <p className="text-gray-500 dark:text-gray-400">Không tìm thấy người dùng nào khớp với từ khóa của bạn.</p>
              </div>
            )}
          </div>
        ) : null}

        {/* Popular Tags Section */}
        {filterBy === 'all' || filterBy === 'tags' ? (
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Thẻ Phổ Biến</h2>
            <div className="flex flex-wrap gap-3">
              {['núi', 'thiên nhiên', 'bình minh', 'hoàng hôn', 'phong cảnh', 'động vật', 'biển', 'rừng'].map((tag) => (
                <Link
                  key={tag}
                  to={`/search?q=${encodeURIComponent(tag)}`}
                  className="px-6 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-medium text-gray-900 dark:text-white shadow-sm"
                >
                  <span>#{tag}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

