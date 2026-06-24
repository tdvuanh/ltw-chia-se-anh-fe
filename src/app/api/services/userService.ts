import { ApiClient } from '../client';
import { ChangePasswordPayload, Photo, UpdateProfileDto, User } from '../types';

export const userService = {
  /**
   * Lấy thông tin hồ sơ của một người dùng bất kỳ theo ID hoặc Username.
   * [GET /users/:id]
   */
  getUserProfile: async (id: string | number): Promise<{ user: User }> => {
    return ApiClient.get<{ user: User }>(`/users/${id}`);
  },

  /**
   * Lấy thông tin cá nhân của người dùng hiện tại đang đăng nhập.
   * [GET /users/me]
   */
  getAuthenticatedUserProfile: async (): Promise<{ user: User }> => {
    return ApiClient.get<{ user: User }>('/users/me');
  },

  /**
   * Cập nhật thông tin chi tiết cá nhân (Full name, tiểu sử, avatar...).
   * [PATCH /users/:id]
   */
  updateUserProfile: async (id: string | number, data: UpdateProfileDto): Promise<{ user: User; message: string }> => {
    return ApiClient.patch<{ user: User; message: string }>(`/users/${id}`, data);
  },

  /**
   * Tải lên / thay đổi ảnh đại diện (multipart form-data).
   * [POST /users/me/avatar]
   */
  uploadAvatar: async (file: File): Promise<{ user: User; message: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return ApiClient.post<{ user: User; message: string }>('/users/me/avatar', formData);
  },

  /**
   * Đổi mật khẩu của người dùng hiện tại.
   * [POST /users/me/change-password]
   */
  changePassword: async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
    return ApiClient.post<{ message: string }>('/users/me/change-password', payload);
  },

  /**
   * Tìm kiếm người dùng theo username hoặc full name.
   * [GET /users/search]
   */
  searchUsers: async (query: string, page = 1, limit = 20): Promise<{ users: User[]; pagination: any }> => {
    return ApiClient.get<{ users: User[]; pagination: any }>(
      `/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  },

  // ----------------------------------------------------
  // Phân hệ Follow (Theo dõi)
  // ----------------------------------------------------

  /**
   * Bắt đầu theo dõi một người dùng.
   * [POST /users/:id/follow]
   */
  followUser: async (id: string | number): Promise<{ message: string }> => {
    return ApiClient.post<{ message: string }>(`/users/${id}/follow`);
  },

  /**
   * Hủy theo dõi một người dùng.
   * [DELETE /users/:id/follow]
   */
  unfollowUser: async (id: string | number): Promise<{ message: string }> => {
    return ApiClient.delete<{ message: string }>(`/users/${id}/follow`);
  },

  /**
   * Lấy danh sách những người đang theo dõi người dùng này.
   * [GET /users/:id/followers]
   */
  getUserFollowers: async (id: string | number, page = 1, limit = 20): Promise<{ followers: User[]; pagination: any }> => {
    return ApiClient.get<{ followers: User[]; pagination: any }>(`/users/${id}/followers?page=${page}&limit=${limit}`);
  },

  /**
   * Lấy danh sách những người mà người dùng này đang theo dõi.
   * [GET /users/:id/following]
   */
  getUserFollowing: async (id: string | number, page = 1, limit = 20): Promise<{ following: User[]; pagination: any }> => {
    return ApiClient.get<{ following: User[]; pagination: any }>(`/users/${id}/following?page=${page}&limit=${limit}`);
  },

  // ----------------------------------------------------
  // Các tiện ích bổ trợ cục bộ cho UI mock
  // ----------------------------------------------------

  /**
   * Lấy danh sách toàn bộ ảnh yêu thích của người dùng hiện tại.
   */
  getFavoritePhotos: async (): Promise<Photo[]> => {
    return ApiClient.get<Photo[]>('/users/favorites');
  },

  /**
   * Lấy danh sách album sưu tập của người dùng.
   */
  getAlbums: async (): Promise<{ id: string; name: string; coverUrl?: string; photosCount: number }[]> => {
    return ApiClient.get<{ id: string; name: string; coverUrl?: string; photosCount: number }[]>('/users/albums');
  },

  /**
   * Lấy danh sách thông báo hoạt động.
   */
  getNotifications: async (): Promise<any[]> => {
    return ApiClient.get<any[]>('/users/notifications');
  },
};
