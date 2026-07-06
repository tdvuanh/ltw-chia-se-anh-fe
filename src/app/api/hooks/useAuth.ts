import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { transformUser } from '../transformers';
import { LoginCredentials, RegisterCredentials } from '../types';
import { API_CONFIG } from '../config';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/useAuthStore';

/**
 * Custom Hook xử lý tiến trình Đăng nhập.
 * Lưu token cục bộ và chuyển hướng về HomePage khi thành công.
 */
export function useLoginMutation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setUser({
        id: data.user.id,
        username: data.user.username,
        full_name: data.user.full_name,
      });
      toast.success(`Chào mừng trở lại, ${data.user.full_name || data.user.username}!`, {
        description: 'Bạn đã đăng nhập hệ thống thành công.',
      });
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    },
    onError: (error: any) => {
      toast.error('Đăng nhập thất bại', {
        description: error.message || 'Email hoặc mật khẩu không chính xác.',
      });
    },
  });
}

/**
 * Custom Hook xử lý đăng ký tài khoản mới.
 */
export function useRegisterMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.register(credentials),
    onSuccess: (data) => {
      toast.success('Đăng ký tài khoản thành công!', {
        description: data.message || 'Vui lòng kiểm tra email của bạn để xác minh tài khoản.',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error('Đăng ký thất bại', {
        description: error.message || 'Tên tài khoản hoặc email đã được sử dụng.',
      });
    },
  });
}

/**
 * Custom Hook xử lý Xác minh địa chỉ Email qua Token.
 */
export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
    onSuccess: (data) => {
      toast.success('Xác minh thành công!', {
        description: data.message || 'Tài khoản của bạn đã được kích hoạt. Hãy đăng nhập ngay.',
      });
    },
    onError: (error: any) => {
      toast.error('Xác minh thất bại', {
        description: error.message || 'Mã xác minh không hợp lệ hoặc đã hết hạn.',
      });
    },
  });
}

/**
 * Custom Hook gửi yêu cầu Quên mật khẩu.
 */
export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data) => {
      toast.success('Đã gửi email khôi phục!', {
        description: data.message || 'Vui lòng kiểm tra hộp thư đến để nhận liên kết đặt lại mật khẩu.',
      });
    },
    onError: (error: any) => {
      toast.error('Không thể gửi yêu cầu', {
        description: error.message || 'Địa chỉ email không tồn tại trong hệ thống.',
      });
    },
  });
}

/**
 * Custom Hook xử lý đặt lại mật khẩu mới qua mã Token.
 */
export function useResetPasswordMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, newPassword, confirmPassword }: any) =>
      authService.resetPassword(token, newPassword, confirmPassword),
    onSuccess: (data) => {
      toast.success('Đặt lại mật khẩu thành công!', {
        description: data.message || 'Mật khẩu của bạn đã thay đổi. Vui lòng đăng nhập bằng mật khẩu mới.',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error('Thay đổi mật khẩu thất bại', {
        description: error.message || 'Mã khôi phục đã hết hạn hoặc không khớp mật khẩu.',
      });
    },
  });
}

/**
 * Custom Hook truy vấn thông tin Người dùng Hiện tại đang đăng nhập.
 */
export function useCurrentUserQuery() {
  const token = localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!token) {
        clearUser();
        return null;
      }
      try {
        const response = await userService.getAuthenticatedUserProfile();
        const user = response?.user ? transformUser(response.user) : null;
        if (user) {
          setUser({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
          });
        } else {
          clearUser();
        }
        return user;
      } catch (error: any) {
        // Nếu lỗi 401 hoặc token hết hạn, xóa token khỏi storage
        if (error?.statusCode === 401 || error?.status === 401) {
          localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
        }
        clearUser();
        return null;
      }
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 phút cache
    retry: false, // Không retry nếu lỗi auth
  });
}

/**
 * Custom Hook xử lý đăng xuất khỏi hệ thống.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearUser();
      // Xóa sạch toàn bộ cache thay vì invalidateQueries(), vì invalidate sẽ
      // kích hoạt refetch ngay cho mọi query đang active (kể cả query cần token)
      // trong khi token đã bị xóa -> trả về lỗi 401 "Access token is missing".
      queryClient.clear();
      queryClient.setQueryData(['currentUser'], null);
      toast.success('Đăng xuất thành công!', {
        description: 'Bạn đã đăng xuất khỏi tài khoản an toàn.',
      });
      navigate('/login');
    },
    onError: (error: any) => {
      // Dù có lỗi server hay không, vẫn tiến hành dọn dẹp ở client
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
      clearUser();
      queryClient.clear();
      queryClient.setQueryData(['currentUser'], null);
      toast.success('Đăng xuất thành công (Client-side)!', {
        description: 'Tài khoản của bạn đã được đăng xuất.',
      });
      navigate('/login');
    },
  });
}

/**
 * Custom Hook xử lý đăng nhập dạng Modal Popup.
 * Không tự động chuyển hướng trang, cho phép đóng modal linh hoạt.
 */
export function useModalLoginMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.login(credentials),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setUser({
        id: data.user.id,
        username: data.user.username,
        full_name: data.user.full_name,
      });
      toast.success(`Chào mừng trở lại, ${data.user.full_name || data.user.username}!`, {
        description: 'Bạn đã đăng nhập hệ thống thành công.',
      });
      onSuccessCallback?.();
    },
    onError: (error: any) => {
      toast.error('Đăng nhập thất bại', {
        description: error.message || 'Email hoặc mật khẩu không chính xác.',
      });
    },
  });
}

