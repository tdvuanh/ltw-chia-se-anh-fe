import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { photoService } from '../services/photoService';
import { transformUser, transformPhoto } from '../transformers';
import { ChangePasswordPayload, UpdateProfileDto } from '../types';
import { toast } from 'sonner';

/**
 * Custom Hook truy xuất thông tin hồ sơ của người dùng (bản thân hoặc người khác).
 */
export function useUserProfileQuery(idOrUsername: string | number) {
  const isOwnProfile = idOrUsername === 'current';

  return useQuery({
    queryKey: ['userProfile', String(idOrUsername)],
    queryFn: async () => {
      if (!idOrUsername) return null;
      if (isOwnProfile) {
        const response = await userService.getAuthenticatedUserProfile();
        return response?.user ? transformUser(response.user) : null;
      } else {
        const response = await userService.getUserProfile(idOrUsername);
        return response?.user ? transformUser(response.user) : null;
      }
    },
    enabled: !!idOrUsername,
    retry: false,
  });
}

/**
 * Custom Hook truy xuất toàn bộ hình ảnh đã tải lên của một người dùng cụ thể.
 */
export function useUserPhotosQuery(userId: string | number | undefined) {
  return useQuery({
    queryKey: ['userPhotos', String(userId)],
    queryFn: async () => {
      if (!userId) return [];
      const response = await photoService.getUserPhotos(userId, 1, 100);
      const rawPhotos = response?.photos || [];
      return rawPhotos.map(transformPhoto);
    },
    enabled: !!userId,
  });
}

/**
 * Custom Hook xử lý bắt đầu theo dõi người dùng.
 */
export function useFollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      return userService.followUser(userId);
    },
    onSuccess: (data, userId) => {
      // Làm mới dữ liệu profile của người dùng được theo dõi
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Làm mới dữ liệu người dùng hiện tại để đồng bộ số lượng following
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Đã theo dõi người dùng thành công!');
    },
    onError: (error: any) => {
      toast.error('Theo dõi thất bại', {
        description: error.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      });
    },
  });
}

/**
 * Custom Hook xử lý hủy theo dõi người dùng.
 */
export function useUnfollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string | number) => {
      return userService.unfollowUser(userId);
    },
    onSuccess: (data, userId) => {
      // Làm mới dữ liệu profile của người dùng được hủy theo dõi
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      // Làm mới dữ liệu người dùng hiện tại để đồng bộ số lượng following
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast.success('Đã hủy theo dõi thành công.');
    },
    onError: (error: any) => {
      toast.error('Hủy theo dõi thất bại', {
        description: error.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      });
    },
  });
}

/**
 * Custom Hook tìm kiếm người dùng.
 */
export function useSearchUsersQuery(query: string) {
  return useQuery({
    queryKey: ['searchUsers', query],
    queryFn: async () => {
      if (!query.trim()) return { users: [] };
      return userService.searchUsers(query, 1, 100);
    },
    select: (response) => {
      const rawUsers = response?.users || [];
      return rawUsers.map(transformUser);
    },
    enabled: !!query.trim(),
  });
}

/**
 * Custom Hook cập nhật thông tin hồ sơ cá nhân (full_name, bio, avatar_url).
 */
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string | number;
      data: UpdateProfileDto;
    }) => {
      const response = await userService.updateUserProfile(userId, data);
      return response?.user ? transformUser(response.user) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Cập nhật hồ sơ thành công!');
    },
    onError: (error: any) => {
      toast.error('Cập nhật hồ sơ thất bại', {
        description: error.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      });
    },
  });
}

/**
 * Custom Hook tải lên / thay đổi ảnh đại diện.
 */
export function useUploadAvatarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const response = await userService.uploadAvatar(file);
      return response?.user ? transformUser(response.user) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Đã cập nhật ảnh đại diện!');
    },
    onError: (error: any) => {
      toast.error('Tải ảnh đại diện thất bại', {
        description: error.message || 'Chỉ chấp nhận tệp ảnh, tối đa 10MB.',
      });
    },
  });
}

/**
 * Custom Hook đổi mật khẩu.
 */
export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      return userService.changePassword(payload);
    },
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công!');
    },
    onError: (error: any) => {
      toast.error('Đổi mật khẩu thất bại', {
        description: error.message || 'Vui lòng kiểm tra lại mật khẩu hiện tại.',
      });
    },
  });
}

