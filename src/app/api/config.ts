/**
 * Cấu hình tham số kết nối API tập trung cho toàn bộ ứng dụng.
 */
export const API_CONFIG = {
  // Đọc từ biến môi trường của Vite, tự động fallback về localhost nếu không cấu hình
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',

  // Thời gian timeout tối đa cho một request (milliseconds)
  TIMEOUT_MS: 15000,

  // Khóa lưu trữ token trong localStorage
  TOKEN_STORAGE_KEY: 'auth_token',
};
