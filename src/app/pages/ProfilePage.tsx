import { useParams, Link } from 'react-router';
import { PhotoCard } from '../components/PhotoCard';
import { Settings, UserPlus, UserCheck, MapPin, Calendar, Link as LinkIcon, Loader2 } from 'lucide-react';
import {
  useCurrentUserQuery,
  useUserProfileQuery,
  useUserPhotosQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useToggleLikeMutation,
} from '../api';

export default function ProfilePage() {
  const { username, id } = useParams();

  // 1. Tải thông tin tài khoản người dùng hiện tại đang đăng nhập
  const { data: currentUser } = useCurrentUserQuery();

  // Xác định đối tượng profile cần truy vấn
  const targetUser = username === 'current' ? 'current' : username || '';

  // 2. Tải thông tin hồ sơ của tài khoản đang xem
  const { data: profile, isLoading: isLoadingProfile, error: profileError } = useUserProfileQuery(id);

  // Xác định xem đây có phải hồ sơ của chính mình hay không
  const isOwnProfile =
    targetUser === 'current' ||
    (currentUser && profile && String(currentUser.username) === String(profile.username));

  // 3. Tải danh sách ảnh của người dùng này sau khi đã lấy được ID từ hồ sơ
  const { data: photos = [], isLoading: isLoadingPhotos } = useUserPhotosQuery(profile?.id);

  // 4. Các mutation tương tác Theo dõi và Thích ảnh
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();
  const { toggleLike } = useToggleLikeMutation();

  const handleFollowToggle = () => {
    if (!profile) return;
    if (profile.isFollowing) {
      unfollowMutation.mutate(profile.id);
    } else {
      followMutation.mutate(profile.id);
    }
  };

  // Trạng thái tải hồ sơ
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải hồ sơ cá nhân...</p>
        </div>
      </div>
    );
  }

  // Trạng thái lỗi không tìm thấy người dùng
  if (profileError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy người dùng</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Tài khoản người dùng bạn đang tìm kiếm không tồn tại hoặc đã bị khóa.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-md inline-block"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  const profileDisplayName = profile.full_name || profile.displayName || profile.username;
  const isFollowingPending = followMutation.isPending || unfollowMutation.isPending;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Cover banner premium */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-500 to-pink-500 h-48 sm:h-60 shadow-inner"></div>

      <div className="container mx-auto max-w-[1400px] px-4">
        <div className="relative -mt-20 sm:-mt-24 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 border dark:border-gray-700 transition-all duration-300">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              {/* Avatar người dùng */}
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white dark:border-gray-800 overflow-hidden flex-shrink-0">
                {profile.avatar_url || profile.avatarUrl ? (
                  <img
                    src={profile.avatar_url || profile.avatarUrl}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileDisplayName.substring(0, 1).toUpperCase()
                )}
              </div>

              {/* Thông tin chi tiết */}
              <div className="flex-1 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold mb-1 text-gray-900 dark:text-white flex items-center gap-2">
                      {profileDisplayName}
                      {profile.role === 'admin' && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-full font-bold uppercase tracking-wider">
                          Admin
                        </span>
                      )}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">@{profile.username}</p>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl text-sm leading-relaxed">
                      {profile.bio || 'Đam mê chụp ảnh nghệ thuật và chia sẻ khoảnh khắc đẹp trong cuộc sống.'}
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span>{profile.location || 'Hà Nội, Việt Nam'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span>
                          Tham gia từ{' '}
                          {profile.created_at
                            ? new Date(profile.created_at).toLocaleDateString('vi-VN', {
                              month: 'numeric',
                              year: 'numeric',
                            })
                            : 'Đang cập nhật'}
                        </span>
                      </div>
                      {profile.website && (
                        <div className="flex items-center gap-1.5">
                          <LinkIcon className="w-4 h-4 text-purple-500" />
                          <a
                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nút thao tác profile */}
                  <div className="flex gap-2 flex-shrink-0 self-end lg:self-center">
                    {isOwnProfile ? (
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white font-semibold text-sm cursor-pointer"
                      >
                        <Settings className="w-4.5 h-4.5" />
                        Chỉnh Sửa Hồ Sơ
                      </Link>
                    ) : (
                      <button
                        onClick={handleFollowToggle}
                        disabled={isFollowingPending}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors font-semibold text-sm cursor-pointer ${profile.isFollowing
                          ? 'border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                          : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                          }`}
                      >
                        {isFollowingPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : profile.isFollowing ? (
                          <>
                            <UserCheck className="w-4.5 h-4.5 text-purple-500" />
                            Đang Theo Dõi
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4.5 h-4.5" />
                            Theo Dõi
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Các chỉ số thống kê */}
                <div className="flex gap-8 mt-6 pt-6 border-t dark:border-gray-700 text-center sm:text-left">
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{photos.length}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Ảnh</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {profile.followersCount || profile.followers_count || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Người Theo Dõi</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {profile.followingCount || profile.following_count || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Đang Theo Dõi</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {profile.totalLikes || profile.likes_count || 0}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Tổng Lượt Thích</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lưới hình ảnh đã đăng */}
        <div className="pb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
            <span>Ảnh Đã Đăng</span>
            <span className="text-sm px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full font-bold">
              {photos.length}
            </span>
          </h2>

          {isLoadingPhotos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-4 border dark:border-gray-700">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
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
                  username={photo.username || profile.username}
                  userAvatar={photo.userAvatar || profile.avatarUrl || profile.avatar_url}
                  userId={photo.userId || profile.id}
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
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 shadow-sm">
              <p className="text-gray-500 dark:text-gray-400">Chưa có bức ảnh nào được đăng tải công khai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
