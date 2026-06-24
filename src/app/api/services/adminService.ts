import { ApiClient } from '../client';
import { ActivityItem, DashboardStats, Photo, User } from '../types';

export const adminService = {
  /**
   * Lấy toàn bộ số liệu thống kê tổng quan và báo cáo dành cho admin.
   * [GET /admin/stats]
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    return ApiClient.get<DashboardStats>('/admin/stats');
  },

  /**
   * Phê duyệt hoặc từ chối kiểm duyệt một bức ảnh đang chờ.
   * [PATCH /admin/photos/:id/moderate]
   */
  moderatePhoto: async (
    photoId: string | number,
    status: 'approved' | 'rejected'
  ): Promise<{ photo: Photo }> => {
    return ApiClient.patch<{ photo: Photo }>(`/admin/photos/${photoId}/moderate`, { status });
  },

  /**
   * Thay đổi trạng thái người dùng (Ví dụ: Khóa/Cấm hoặc Mở khóa).
   * [PATCH /admin/users/:id/status]
   */
  updateUserStatus: async (
    userId: string | number,
    status: 'active' | 'banned'
  ): Promise<{ user: User }> => {
    return ApiClient.patch<{ user: User }>(`/admin/users/${userId}/status`, { status });
  },

  /**
   * Admin thực hiện xóa một bức ảnh vi phạm.
   * [DELETE /admin/photos/:id]
   */
  deletePhoto: async (photoId: string | number): Promise<{ message: string }> => {
    return ApiClient.delete<{ message: string }>(`/admin/photos/${photoId}`);
  },

  /**
   * Admin thực hiện xóa một bình luận vi phạm.
   * [DELETE /admin/comments/:id]
   */
  deleteComment: async (commentId: string | number): Promise<{ message: string }> => {
    return ApiClient.delete<{ message: string }>(`/admin/comments/${commentId}`);
  },

  /**
   * Lấy danh sách toàn bộ ảnh đang chờ kiểm duyệt.
   * [GET /admin/moderation/pending]
   */
  getPendingPhotos: async (): Promise<Photo[]> => {
    return ApiClient.get<Photo[]>('/admin/moderation/pending');
  },

  /**
   * Lấy danh sách toàn bộ người dùng trong hệ thống.
   * [GET /admin/users]
   */
  getUsersList: async (): Promise<User[]> => {
    return ApiClient.get<User[]>('/admin/users');
  },

  /**
   * Lấy dòng hoạt động gần đây thật của hệ thống (đăng ảnh / bình luận / theo dõi).
   * [GET /admin/activity]
   */
  getRecentActivity: async (limit = 10): Promise<ActivityItem[]> => {
    return ApiClient.get<ActivityItem[]>(`/admin/activity?limit=${limit}`);
  },

  /**
   * Lấy danh sách các nội dung bị báo cáo vi phạm (dữ liệu thật).
   * [GET /admin/reports]
   */
  getReportedContent: async (
    status: 'pending' | 'resolved' | 'dismissed' | 'all' = 'pending'
  ): Promise<any[]> => {
    return ApiClient.get<any[]>(`/admin/reports?status=${status}`);
  },

  /**
   * Bỏ qua phiếu báo cáo (xoá phiếu, giữ nguyên nội dung).
   * [DELETE /admin/reports/:id]
   */
  deleteReport: async (reportId: string | number): Promise<void> => {
    return ApiClient.delete<void>(`/admin/reports/${reportId}`);
  },

  /**
   * Xử lý phiếu báo cáo: gỡ bỏ nội dung vi phạm (ảnh hoặc bình luận).
   * [PATCH /admin/reports/:id/resolve]
   */
  resolveReport: async (reportId: string | number): Promise<{ message: string }> => {
    return ApiClient.patch<{ message: string }>(`/admin/reports/${reportId}/resolve`);
  },
};
