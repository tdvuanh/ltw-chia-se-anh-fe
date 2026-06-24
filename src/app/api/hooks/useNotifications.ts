import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import { transformNotification } from '../transformers';

/**
 * Danh sách thông báo (tất cả hoặc chỉ chưa đọc).
 */
export function useNotificationsQuery(onlyUnread = false) {
  return useQuery({
    queryKey: ['notifications', onlyUnread ? 'unread' : 'all'],
    queryFn: async () => {
      const res = await notificationService.getNotifications(onlyUnread, 50);
      return (res || []).map(transformNotification);
    },
  });
}

/**
 * Số thông báo chưa đọc — tự refetch mỗi 30s để mô phỏng cập nhật real-time.
 */
export function useUnreadCountQuery(enabled = true) {
  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await notificationService.getUnreadCount();
      return res?.unread ?? 0;
    },
    enabled,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
