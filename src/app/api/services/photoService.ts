import { ApiClient } from '../client';
import { Comment, Photo, UploadPhotoDto, UploadPhotoPayload, User } from '../types';

export const photoService = {
  /**
   * Lấy danh sách ảnh thịnh hành có phân trang.
   * [GET /photos]
   */
  getPhotos: async (page = 1, limit = 20): Promise<{ photos: Photo[]; pagination: any }> => {
    return ApiClient.get<{ photos: Photo[]; pagination: any }>(`/photos?page=${page}&limit=${limit}`);
  },

  /**
   * Lấy trang bảng tin cá nhân từ những người dùng đang theo dõi (Yêu cầu Token).
   * [GET /photos/feed]
   */
  getPersonalFeed: async (page = 1, limit = 20): Promise<{ photos: Photo[]; pagination: any }> => {
    return ApiClient.get<{ photos: Photo[]; pagination: any }>(`/photos/feed?page=${page}&limit=${limit}`);
  },

  /**
   * Lấy danh sách ảnh người dùng hiện tại đã thích (Yêu cầu Token).
   * [GET /photos/liked]
   */
  getLikedPhotos: async (page = 1, limit = 50): Promise<{ photos: Photo[]; pagination: any }> => {
    return ApiClient.get<{ photos: Photo[]; pagination: any }>(`/photos/liked?page=${page}&limit=${limit}`);
  },

  /**
   * Lấy chi tiết một bức ảnh bao gồm thông tin EXIF và các comments.
   * [GET /photos/:id]
   */
  getPhotoDetail: async (id: string | number): Promise<{ photo: Photo }> => {
    return ApiClient.get<{ photo: Photo }>(`/photos/${id}`);
  },

  /**
   * Lấy danh sách ảnh công khai của một người dùng cụ thể.
   * [GET /photos/user/:userId]
   */
  getUserPhotos: async (userId: string | number, page = 1, limit = 20): Promise<{ photos: Photo[]; pagination: any }> => {
    return ApiClient.get<{ photos: Photo[]; pagination: any }>(`/photos/user/${userId}?page=${page}&limit=${limit}`);
  },

  /**
   * Tìm kiếm ảnh theo tiêu đề, mô tả hoặc thẻ tags.
   * [GET /photos/search]
   */
  searchPhotos: async (query: string, page = 1, limit = 20): Promise<{ photos: Photo[]; pagination: any }> => {
    return ApiClient.get<{ photos: Photo[]; pagination: any }>(
      `/photos/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  },

  /**
   * Đăng ảnh mới lên hệ thống.
   * [POST /photos]
   */
  uploadPhoto: async (data: UploadPhotoPayload): Promise<{ photo: Photo; message: string }> => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('image', data.image);
    if (data.tags && data.tags.length > 0) {
      formData.append('tags', JSON.stringify(data.tags));
    }
    return ApiClient.post<{ photo: Photo; message: string }>('/photos', formData);
  },

  /**
   * Cập nhật thông tin ảnh đã đăng (Chỉ dành cho chủ sở hữu ảnh).
   * [PATCH /photos/:id]
   */
  updatePhoto: async (id: string | number, data: Partial<UploadPhotoDto>): Promise<{ photo: Photo; message: string }> => {
    return ApiClient.put<{ photo: Photo; message: string }>(`/photos/${id}`, data);
  },

  /**
   * Xóa ảnh khỏi hệ thống (Chỉ dành cho chủ ảnh hoặc admin).
   * [DELETE /photos/:id]
   */
  deletePhoto: async (id: string | number): Promise<{ message: string }> => {
    return ApiClient.delete<{ message: string }>(`/photos/${id}`);
  },

  // ----------------------------------------------------
  // Phân hệ Likes (Lượt thích)
  // ----------------------------------------------------

  /**
   * Thích một bức ảnh.
   * [POST /photos/:id/like]
   */
  likePhoto: async (id: string | number): Promise<{ message: string }> => {
    return ApiClient.post<{ message: string }>(`/photos/${id}/like`);
  },

  /**
   * Bỏ thích một bức ảnh.
   * [DELETE /photos/:id/like]
   */
  unlikePhoto: async (id: string | number): Promise<{ message: string }> => {
    return ApiClient.delete<{ message: string }>(`/photos/${id}/like`);
  },

  /**
   * Lấy danh sách toàn bộ người dùng đã thích một bức ảnh.
   * [GET /photos/:id/likes]
   */
  getPhotoLikes: async (id: string | number): Promise<{ users: User[] }> => {
    return ApiClient.get<{ users: User[] }>(`/photos/${id}/likes`);
  },

  // ----------------------------------------------------
  // Phân hệ Comments (Bình luận)
  // ----------------------------------------------------

  /**
   * Lấy danh sách toàn bộ bình luận của một ảnh cụ thể (Có hỗ trợ phân trang).
   * [GET /comments/photo/:photoId]
   */
  getComments: async (photoId: string | number, page = 1, limit = 20): Promise<{ comments: Comment[]; pagination: any }> => {
    return ApiClient.get<{ comments: Comment[]; pagination: any }>(`/comments/photos/${photoId}?page=${page}&limit=${limit}`);
  },

  /**
   * Gửi đăng bình luận mới dưới ảnh.
   * [POST /comments]
   */
  addComment: async (photoId: string | number, content: string): Promise<{ comment: Comment; message: string }> => {
    return ApiClient.post<{ comment: Comment; message: string }>('/comments', {
      photo_id: photoId,
      content,
    });
  },

  /**
   * Cập nhật nội dung bình luận của bạn.
   * [PATCH /comments/:id]
   */
  updateComment: async (id: string | number, content: string): Promise<{ comment: Comment; message: string }> => {
    return ApiClient.put<{ comment: Comment; message: string }>(`/comments/${id}`, { content });
  },

  /**
   * Xóa một bình luận (Chỉ tác giả bình luận hoặc chủ ảnh).
   * [DELETE /comments/:id]
   */
  deleteComment: async (id: string | number): Promise<{ message: string }> => {
    return ApiClient.delete<{ message: string }>(`/comments/${id}`);
  },
};
