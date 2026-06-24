import { ApiClient } from '../client';
import { ReportPayload } from '../types';

/**
 * Dịch vụ gửi báo cáo nội dung vi phạm (ảnh hoặc bình luận) từ phía người dùng.
 */
export const reportService = {
  /**
   * Gửi một báo cáo vi phạm.
   * [POST /reports]
   */
  reportContent: async (payload: ReportPayload): Promise<{ report: any }> => {
    return ApiClient.post<{ report: any }>('/reports', payload);
  },

  /**
   * Tiện ích: báo cáo nhanh một bức ảnh.
   */
  reportPhoto: async (
    photoId: string | number,
    reason: string,
    description?: string
  ): Promise<{ report: any }> => {
    return ApiClient.post<{ report: any }>('/reports', {
      target_type: 'photo',
      target_id: photoId,
      reason,
      description,
    });
  },

  /**
   * Tiện ích: báo cáo nhanh một bình luận.
   */
  reportComment: async (
    commentId: string | number,
    reason: string,
    description?: string
  ): Promise<{ report: any }> => {
    return ApiClient.post<{ report: any }>('/reports', {
      target_type: 'comment',
      target_id: commentId,
      reason,
      description,
    });
  },
};
