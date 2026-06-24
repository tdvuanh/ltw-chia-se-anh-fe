import { useState } from 'react';
import { Check, X, Trash2, Lock, Unlock, TrendingUp, Users, Image as ImageIcon, MessageCircle, Heart, ShieldAlert, UserPlus, FileDown } from 'lucide-react';
import { exportAdminReportPDF } from '../utils/exportReport';
import {
  useAdminStatsQuery,
  useAdminPendingPhotosQuery,
  useAdminUsersQuery,
  useAdminReportsQuery,
  useAdminActivityQuery,
  useModeratePhotoMutation,
  useUpdateUserStatusMutation,
  useDeleteReportMutation,
  useResolveReportMutation,
} from '../api/hooks/useAdmin';

const ACTIVITY_ICON: Record<string, any> = {
  photo: ImageIcon,
  comment: MessageCircle,
  follow: UserPlus,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'moderation' | 'users' | 'reports'>('overview');

  const { data: stats, isLoading: isStatsLoading } = useAdminStatsQuery();
  const { data: pendingPhotos = [], isLoading: isPendingPhotosLoading } = useAdminPendingPhotosQuery();
  const { data: users = [], isLoading: isUsersLoading } = useAdminUsersQuery();
  const { data: reports = [], isLoading: isReportsLoading } = useAdminReportsQuery('pending');
  const { data: activity = [] } = useAdminActivityQuery();

  const moderatePhotoMutation = useModeratePhotoMutation();
  const updateUserStatusMutation = useUpdateUserStatusMutation();
  const deleteReportMutation = useDeleteReportMutation();
  const resolveReportMutation = useResolveReportMutation();

  const handleApprovePhoto = (photoId: string | number) => {
    moderatePhotoMutation.mutate({ photoId, status: 'approved' });
  };

  const handleRejectPhoto = (photoId: string | number) => {
    moderatePhotoMutation.mutate({ photoId, status: 'rejected' });
  };

  const handleToggleUserStatus = (userId: string | number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    updateUserStatusMutation.mutate({ userId, status: newStatus });
  };

  const handleDeleteReport = (reportId: string | number) => {
    deleteReportMutation.mutate(reportId);
  };

  const handleResolveReport = (reportId: string | number) => {
    if (window.confirm('Gỡ bỏ vĩnh viễn nội dung bị báo cáo này?')) {
      resolveReportMutation.mutate(reportId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Bảng Điều Khiển Quản Trị</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý người dùng, kiểm duyệt nội dung và xem thống kê</p>
        </div>

        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tổng Quan
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'moderation'
                ? 'border-purple-500 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Kiểm Duyệt ({pendingPhotos.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-purple-500 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Người Dùng ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'reports'
                ? 'border-purple-500 text-purple-600 font-semibold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Báo Cáo ({reports.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          isStatsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => exportAdminReportPDF(stats, activity)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-sm"
                >
                  <FileDown className="w-4 h-4" />
                  Xuất Báo Cáo PDF
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Tổng Người Dùng</h3>
                    <Users className="w-8 h-8 text-purple-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_users?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-2">Đăng ký trên hệ thống</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Tổng Ảnh</h3>
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_photos?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-2">Ảnh đã được đăng tải</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Ảnh Chờ Duyệt</h3>
                    <MessageCircle className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.photos_by_status?.pending?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400 mt-2">Cần được kiểm duyệt</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Người Dùng Bị Khóa</h3>
                    <TrendingUp className="w-8 h-8 text-red-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.banned_users?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 mt-2">Tài khoản vi phạm</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Người Dùng Hoạt Động</h3>
                    <Users className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats?.active_users?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-2">Có tương tác gần đây</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Tổng Lượt Thích</h3>
                    <Heart className="w-8 h-8 text-pink-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {(stats?.total_likes ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-pink-600 dark:text-pink-400 mt-2">Lượt thích toàn hệ thống</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Tổng Bình Luận</h3>
                    <MessageCircle className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {(stats?.total_comments ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400 mt-2">Bình luận đã đăng</div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-gray-600 dark:text-gray-400">Báo Cáo Chờ Xử Lý</h3>
                    <ShieldAlert className="w-8 h-8 text-amber-500" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {(stats?.pending_reports ?? 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-amber-600 dark:text-amber-400 mt-2">Cần admin xem xét</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Hoạt Động Gần Đây</h2>
                {activity.length > 0 ? (
                  <div className="space-y-3">
                    {activity.map((item, index) => {
                      const Icon = ACTIVITY_ICON[item.type] || ImageIcon;
                      return (
                        <div key={index} className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="font-semibold text-gray-900 dark:text-white">{item.user}</span>{' '}
                              <span className="text-gray-600 dark:text-gray-400">{item.action}</span>
                              {item.target ? (
                                <span className="text-gray-900 dark:text-gray-200 font-medium"> {item.target}</span>
                              ) : null}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500 dark:text-gray-500">
                            {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Chưa có hoạt động nào.</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Thẻ Phổ Biến</h2>
                {stats?.top_tags && stats.top_tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {stats.top_tags.map((tag) => (
                      <span key={tag.name} className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold">
                        #{tag.name} ({tag.count})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">Chưa có thẻ nào được sử dụng.</p>
                )}
              </div>
            </div>
          )
        )}

        {activeTab === 'moderation' && (
          isPendingPhotosLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Ảnh Chờ Duyệt</h2>
              {pendingPhotos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingPhotos.map((photo) => (
                    <div key={photo.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border dark:border-gray-700">
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-48 object-cover" />
                      <div className="p-4">
                        <h3 className="font-bold mb-1 text-gray-900 dark:text-white">{photo.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">bởi {photo.username}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                          Đăng lúc: {photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleString('vi-VN') : 'Không rõ'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprovePhoto(photo.id)}
                            disabled={moderatePhotoMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                          >
                            <Check className="w-4 h-4" />
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleRejectPhoto(photo.id)}
                            disabled={moderatePhotoMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
                          >
                            <X className="w-4 h-4" />
                            Từ Chối
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">Không có ảnh chờ duyệt</p>
                </div>
              )}
            </div>
          )
        )}

        {activeTab === 'users' && (
          isUsersLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Quản Lý Người Dùng</h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-x-auto border dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Người Dùng</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Tham Gia</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Số Ảnh</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Trạng Thái</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                                {user.username[0].toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-gray-900 dark:text-white">{user.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('vi-VN') : 'Không rõ'}
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.photosCount}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              user.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              disabled={updateUserStatusMutation.isPending}
                              className={`p-2 rounded-lg transition-colors ${
                                user.status === 'active'
                                  ? 'hover:bg-red-50 text-red-600'
                                  : 'hover:bg-green-50 text-green-600'
                              }`}
                              title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {user.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {activeTab === 'reports' && (
          isReportsLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Nội Dung Bị Báo Cáo</h2>
              {reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border dark:border-gray-700">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          {report.targetType === 'photo' && report.imageUrl ? (
                            <img src={report.imageUrl} alt={report.content} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                          ) : null}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-semibold">
                                {report.type}
                              </span>
                              <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm font-semibold">
                                {report.reason}
                              </span>
                            </div>
                            <p className="text-gray-900 dark:text-white mb-1 font-medium">{report.content}</p>
                            {report.contentOwner ? (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                Nội dung của <span className="font-semibold">{report.contentOwner}</span>
                              </p>
                            ) : null}
                            {report.description ? (
                              <p className="text-sm text-gray-600 dark:text-gray-300 italic mb-2">"{report.description}"</p>
                            ) : null}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Báo cáo bởi <span className="font-semibold">{report.reportedBy}</span> • {report.timestamp}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleResolveReport(report.id)}
                            disabled={resolveReportMutation.isPending}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
                            title="Gỡ bỏ nội dung vi phạm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Gỡ Bỏ
                          </button>
                          <button
                            onClick={() => handleDeleteReport(report.id)}
                            disabled={deleteReportMutation.isPending}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            title="Bỏ qua báo cáo, giữ nguyên nội dung"
                          >
                            Bỏ Qua
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">Không có nội dung bị báo cáo</p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
