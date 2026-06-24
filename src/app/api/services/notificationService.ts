import { ApiClient } from '../client';

/**
 * Dịch vụ thông báo: danh sách, số chưa đọc, đánh dấu đã đọc.
 */
export const notificationService = {
  /**
   * Lấy danh sách thông báo. [GET /notifications]
   */
  getNotifications: async (onlyUnread = false, limit = 50): Promise<any[]> => {
    return ApiClient.get<any[]>(`/notifications?unread=${onlyUnread}&limit=${limit}`);
  },

  /**
   * Lấy số thông báo chưa đọc. [GET /notifications/unread-count]
   */
  getUnreadCount: async (): Promise<{ unread: number }> => {
    return ApiClient.get<{ unread: number }>('/notifications/unread-count');
  },

  /**
   * Đánh dấu một thông báo là đã đọc. [PATCH /notifications/:id/read]
   */
  markAsRead: async (id: string | number): Promise<{ message: string }> => {
    return ApiClient.patch<{ message: string }>(`/notifications/${id}/read`);
  },

  /**
   * Đánh dấu tất cả là đã đọc. [PATCH /notifications/read-all]
   */
  markAllAsRead: async (): Promise<{ message: string }> => {
    return ApiClient.patch<{ message: string }>('/notifications/read-all');
  },
};
