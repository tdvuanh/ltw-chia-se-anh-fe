import { ApiClient } from '../client';
import { API_CONFIG } from '../config';
import { LoginCredentials, RegisterCredentials, User } from '../types';

export const authService = {
  /**
   * Đăng nhập người dùng vào hệ thống bằng Email và Mật khẩu.
   * [POST /auth/login]
   */
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    // API.md mong đợi email và password
    const response = await ApiClient.post<{ user: User; token: string }>('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, response.token);
    }
    return response;
  },

  /**
   * Đăng ký tài khoản người dùng mới.
   * [POST /auth/register]
   */
  register: async (credentials: RegisterCredentials): Promise<{ user: User; message?: string }> => {
    // API.md mong đợi username, email, password, confirmPassword, full_name
    return ApiClient.post<{ user: User; message?: string }>('/auth/register', credentials);
  },

  /**
   * Xác minh tài khoản email qua token liên kết.
   * [POST /auth/verify-email]
   */
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    return ApiClient.post<{ message: string }>('/auth/verify-email', { token });
  },

  /**
   * Gửi yêu cầu đặt lại mật khẩu (quên mật khẩu).
   * [POST /auth/forgot-password]
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return ApiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  /**
   * Đặt lại mật khẩu mới thông qua Token được cấp.
   * [POST /auth/reset-password]
   */
  resetPassword: async (token: string, newPassword?: string, confirmPassword?: string): Promise<{ message: string }> => {
    return ApiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
      confirmPassword,
    });
  },

  /**
   * Đăng xuất khỏi hệ thống phía client và server.
   * [POST /auth/logout]
   */
  logout: async (): Promise<void> => {
    try {
      await ApiClient.post<void>('/auth/logout');
    } catch (e) {
      console.warn('Lỗi khi hủy token ở Server, tiến hành xóa token ở Client:', e);
    } finally {
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    }
  },

  /**
   * Kiểm tra xem người dùng hiện tại có phiên đăng nhập cục bộ hay không.
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  },
};
