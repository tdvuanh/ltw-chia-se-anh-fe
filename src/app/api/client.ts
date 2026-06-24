import { API_CONFIG } from './config';
import { ApiError } from './types';

/**
 * Lớp ApiClient nâng cao xử lý giao tiếp RESTful API qua native Fetch.
 * Đóng gói tự động Headers, Authorization Token, Timeout và xử lý Lỗi HTTP chuẩn hóa.
 */
export class ApiClient {
  private static getHeaders(customHeaders?: HeadersInit, isMultipart = false): Headers {
    const headers = new Headers(customHeaders);

    // Tự động thêm Content-Type là application/json nếu không phải gửi FormData
    if (!headers.has('Content-Type') && !isMultipart) {
      headers.set('Content-Type', 'application/json');
    }

    // Tự động chèn Bearer Token từ localStorage nếu có
    const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  /**
   * Phương thức gọi request cốt lõi tích hợp timeout và xử lý lỗi
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${API_CONFIG.BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

    // Xử lý Timeout bằng AbortController
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    // Kiểm tra xem body có phải FormData để tránh ép kiểu JSON Header
    const isMultipart = options.body instanceof FormData;
    const headers = this.getHeaders(options.headers, isMultipart);

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(id);

      // Nếu phản hồi rỗng hoặc trạng thái HTTP là 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      // Đọc dữ liệu phản hồi dạng text trước để tránh lỗi parse JSON nếu body rỗng
      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        responseData = { message: responseText };
      }

      // Xử lý lỗi HTTP (status < 200 hoặc >= 300)
      if (!response.ok) {
        const error: ApiError = {
          success: false,
          statusCode: response.status,
          message: responseData.message || `Lỗi kết nối HTTP: ${response.status}`,
          errors: responseData.errors,
        };

        // Nếu gặp lỗi Unauthorized (401), tự động xóa token và chuyển hướng hoặc phát sự kiện đăng xuất
        if (response.status === 401) {
          localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
          // dispatch event hoặc handle logout
        }

        return Promise.reject(error);
      }

      // Trả về dữ liệu kiểu T mong đợi (thường nằm trực tiếp trong body hoặc trường data)
      return (responseData.data !== undefined ? responseData.data : responseData) as T;
    } catch (error: any) {
      clearTimeout(id);

      // Xử lý lỗi do Timeout/Hủy kết nối hoặc Lỗi mạng
      const isAbort = error.name === 'AbortError';
      const apiError: ApiError = {
        success: false,
        statusCode: isAbort ? 408 : 0,
        message: isAbort
          ? `Yêu cầu bị hủy do quá thời gian chờ (timeout ${API_CONFIG.TIMEOUT_MS}ms)`
          : error.message || 'Lỗi kết nối mạng vật lý hoặc Backend không phản hồi',
      };

      return Promise.reject(apiError);
    }
  }

  // ----------------------------------------------------
  // Các phương thức rút gọn (HTTP Shorthands)
  // ----------------------------------------------------

  public static async get<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public static async post<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, 'method' | 'body'>
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  public static async put<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, 'method' | 'body'>
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  public static async patch<T>(
    endpoint: string,
    data?: any,
    options?: Omit<RequestInit, 'method' | 'body'>
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  public static async delete<T>(endpoint: string, options?: Omit<RequestInit, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}
