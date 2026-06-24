import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Heart, MessageCircle, Eye, Share2, Download, Flag, Bookmark, Loader2, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  usePhotoDetailQuery,
  usePhotoCommentsQuery,
  useAddCommentMutation,
  useDeleteCommentMutation,
  useToggleLikeMutation,
  useCurrentUserQuery,
  reportService,
} from '../api';

const REPORT_REASONS = [
  'Nội dung phản cảm / khiêu dâm',
  'Bạo lực hoặc thù ghét',
  'Spam hoặc lừa đảo',
  'Vi phạm bản quyền',
  'Nội dung khác',
];
import { useAuthModal } from '../contexts/AuthModalContext';
import { toast } from 'sonner';

export default function PhotoDetailPage() {
  const { id } = useParams();
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const { openLoginModal } = useAuthModal();

  // 1. Tải thông tin chi tiết ảnh, danh sách bình luận, và thông tin user hiện tại
  const { data: photo, isLoading: isLoadingPhoto, error: photoError } = usePhotoDetailQuery(id || '');
  const { data: comments = [], isLoading: isLoadingComments } = usePhotoCommentsQuery(id || '');
  const { data: currentUser } = useCurrentUserQuery();

  // 2. Các mutation tương tác từ React Query
  const { toggleLike, isPending: isLiking } = useToggleLikeMutation();
  const addCommentMutation = useAddCommentMutation();
  const deleteCommentMutation = useDeleteCommentMutation();

  const handleLike = () => {
    if (!currentUser) {
      toast.error('Yêu cầu đăng nhập', {
        description: 'Vui lòng đăng nhập để thích bức ảnh này.',
      });
      openLoginModal();
      return;
    }
    if (!photo || isLiking) return;
    toggleLike(photo.id, !!photo.isLiked);
  };

  const handleDownload = () => {
    if (!photo?.imageUrl) return;
    // Download logic
    const link = document.createElement('a');
    link.href = photo.imageUrl;
    link.download = `${photo.title || 'photo'}.jpg`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (platform: string) => {
    alert(`Chia sẻ lên ${platform}`);
    setShowShareModal(false);
  };

  const handleOpenReport = () => {
    if (!currentUser) {
      toast.error('Yêu cầu đăng nhập', {
        description: 'Vui lòng đăng nhập để báo cáo nội dung.',
      });
      openLoginModal();
      return;
    }
    setReportReason(REPORT_REASONS[0]);
    setReportDescription('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    if (!photo || isReporting) return;
    setIsReporting(true);
    try {
      await reportService.reportPhoto(photo.id, reportReason, reportDescription);
      toast.success('Đã gửi báo cáo', {
        description: 'Cảm ơn bạn. Quản trị viên sẽ xem xét nội dung này.',
      });
      setShowReportModal(false);
    } catch (err: any) {
      toast.error('Gửi báo cáo thất bại', {
        description: err?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      });
    } finally {
      setIsReporting(false);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('Yêu cầu đăng nhập', {
        description: 'Vui lòng đăng nhập để bình luận.',
      });
      openLoginModal();
      return;
    }
    if (!id || !newComment.trim() || addCommentMutation.isPending) return;

    addCommentMutation.mutate(
      { photoId: id, content: newComment },
      {
        onSuccess: () => {
          setNewComment('');
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string | number) => {
    if (!id) return;
    if (window.confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) {
      deleteCommentMutation.mutate({ commentId, photoId: id });
    }
  };

  // Trạng thái tải dữ liệu chi tiết ảnh
  if (isLoadingPhoto) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Đang tải chi tiết bức ảnh...</p>
        </div>
      </div>
    );
  }

  // Trạng thái lỗi không tìm thấy ảnh
  if (photoError || !photo) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-8 text-center shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy bức ảnh</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Bức ảnh bạn đang tìm kiếm không tồn tại, chưa được phê duyệt hoặc đã bị gỡ khỏi hệ thống.
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

  const isLiked = !!photo.isLiked;
  const userId = photo.user.id
  const username = photo.username || 'user';
  const displayName = photo.user?.full_name || photo.user?.username || username;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg border dark:border-gray-700">
              <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden border-b dark:border-gray-700">
                <ImageWithFallback
                  src={photo.imageUrl || ''}
                  alt={photo.title}
                  className="w-full h-full object-contain max-h-[600px]"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{photo.title}</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">{photo.description || 'Chưa có mô tả cho bức ảnh này.'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6 border-t border-b dark:border-gray-700 py-4 my-4">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors cursor-pointer ${isLiked
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="font-semibold">{photo.likes_count} Thích</span>
                  </button>

                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">{comments.length} Bình luận</span>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200">
                    <Eye className="w-5 h-5 text-gray-500" />
                    <span className="font-semibold">{photo.views || 0} Xem</span>
                  </div>

                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`ml-auto p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer ${isSaved ? 'text-purple-600' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    title="Lưu"
                  >
                    <Bookmark className={`w-5.5 h-5.5 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
                    title="Chia sẻ"
                  >
                    <Share2 className="w-5.5 h-5.5" />
                  </button>

                  <button
                    onClick={handleDownload}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
                    title="Tải xuống"
                  >
                    <Download className="w-5.5 h-5.5" />
                  </button>

                  <button
                    onClick={handleOpenReport}
                    className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500 cursor-pointer"
                    title="Báo cáo"
                  >
                    <Flag className="w-5.5 h-5.5" />
                  </button>
                </div>

                {/* Report Modal */}
                {showReportModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReportModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-auto shadow-2xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                      <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Báo Cáo Bức Ảnh</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Chọn lý do báo cáo nội dung vi phạm.</p>
                      <div className="space-y-2 mb-4">
                        {REPORT_REASONS.map((reason) => (
                          <label key={reason} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200">
                            <input
                              type="radio"
                              name="reportReason"
                              value={reason}
                              checked={reportReason === reason}
                              onChange={() => setReportReason(reason)}
                              className="accent-purple-600"
                            />
                            <span className="text-sm">{reason}</span>
                          </label>
                        ))}
                      </div>
                      <textarea
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Mô tả thêm (không bắt buộc)..."
                        rows={3}
                        className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white mb-4 text-sm"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowReportModal(false)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-semibold"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSubmitReport}
                          disabled={isReporting}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold disabled:bg-gray-300"
                        >
                          {isReporting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Share Modal */}
                {showShareModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-auto shadow-2xl border dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Chia Sẻ Ảnh</h3>
                      <div className="space-y-2">
                        <button
                          onClick={() => handleShare('Facebook')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white font-medium text-left cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('Twitter')}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white font-medium text-left cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <span>Twitter</span>
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('Đã sao chép liên kết thành công!');
                            setShowShareModal(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-900 dark:text-white font-medium text-left cursor-pointer"
                        >
                          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white">
                            <Share2 className="w-5 h-5" />
                          </div>
                          <span>Sao chép liên kết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-6">
                  {photo.tags && photo.tags.length > 0 ? (
                    photo.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/search?q=${encodeURIComponent(tag)}`}
                        className="px-3.5 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">Không có thẻ tag.</span>
                  )}
                </div>

                <div className="border-t dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Bình luận ({comments.length})</h2>

                  {/* Form viết bình luận - Yêu cầu đăng nhập */}
                  {currentUser ? (
                    <form onSubmit={handleAddComment} className="mb-6">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ suy nghĩ của bạn về bức ảnh này..."
                        className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || addCommentMutation.isPending}
                          className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-semibold disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          {addCommentMutation.isPending ? 'Đang gửi...' : 'Đăng Bình Luận'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/15 border border-purple-100 dark:border-purple-900/30 rounded-lg text-center">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Bạn cần đăng nhập để bình luận hoặc thích bức ảnh này.</p>
                      <button
                        onClick={openLoginModal}
                        className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm inline-block shadow-sm transition-colors cursor-pointer border-0"
                      >
                        Đăng Nhập Ngay
                      </button>
                    </div>
                  )}

                  {/* Danh sách bình luận động */}
                  <div className="space-y-4">
                    {isLoadingComments ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                      </div>
                    ) : comments.length > 0 ? (
                      comments.map((comment) => {
                        const isAuthor = currentUser && String(currentUser.username) === String(comment.username);
                        const isAdmin = currentUser?.role === 'admin';
                        const commentUserAvatar = comment.user?.avatar_url || comment.avatar;
                        const commentDisplayName = comment.user?.full_name || comment.username;

                        return (
                          <div key={comment.id} className="flex gap-3 items-start group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0 shadow-sm">
                              {commentUserAvatar ? (
                                <img src={commentUserAvatar} alt={comment.username} className="w-full h-full object-cover" />
                              ) : (
                                (comment.username || 'U').substring(0, 1).toUpperCase()
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-1 gap-2">
                                  <div>
                                    <Link to={`/profile/${comment.username}/${comment.user?.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                                      {commentDisplayName}
                                    </Link>
                                    <span className="text-xs text-gray-400 ml-2">@{comment.username}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {comment.created_at ? new Date(comment.created_at).toLocaleDateString('vi-VN') : 'Mới'}
                                    </span>
                                    {(isAuthor || isAdmin) && (
                                      <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5 rounded cursor-pointer"
                                        title="Xóa bình luận"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">{comment.content || comment.comment}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ suy nghĩ!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Photographer info & EXIF data */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24 border dark:border-gray-700">
              <div className="flex items-center gap-3 mb-6">
                <Link to={`/profile/${username}/${userId}`} className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-md">
                  {photo.userAvatar ? (
                    <img src={photo.userAvatar} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    username[0].toUpperCase()
                  )}
                </Link>
                <div className="flex-1">
                  <Link to={`/profile/${username}/${userId}`} className="font-bold text-lg hover:text-purple-600 dark:hover:text-purple-400 text-gray-900 dark:text-white truncate block max-w-[180px]">
                    {displayName}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">@{username}</p>
                </div>
              </div>

              <Link
                to={`/profile/${username}/${userId}`}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold mb-4 text-center block shadow-sm"
              >
                Xem Trang Cá Nhân
              </Link>

              <div className="space-y-3.5 text-sm border-t dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Đăng lúc</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {photo.created_at ? new Date(photo.created_at).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Máy ảnh</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{photo.cameraInfo?.cameraModel || 'Không rõ EXIF'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ống kính</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{photo.cameraInfo?.lensModel || 'Không rõ EXIF'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">ISO</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{photo.cameraInfo?.iso || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Khẩu độ</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{photo.cameraInfo?.aperture || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tốc độ chụp</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{photo.cameraInfo?.shutterSpeed || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
