import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';
import { transformPhoto, transformUser, transformReport } from '../transformers';
import { toast } from 'sonner';

/**
 * Custom Hook truy xuất số liệu thống kê tổng quan của Admin.
 */
export function useAdminStatsQuery() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      return adminService.getDashboardStats();
    },
  });
}

/**
 * Custom Hook truy xuất danh sách ảnh đang chờ kiểm duyệt.
 */
export function useAdminPendingPhotosQuery() {
  return useQuery({
    queryKey: ['adminPendingPhotos'],
    queryFn: async () => {
      const response = await adminService.getPendingPhotos();
      return (response || []).map(transformPhoto);
    },
  });
}

/**
 * Custom Hook truy xuất danh sách toàn bộ người dùng.
 */
export function useAdminUsersQuery() {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await adminService.getUsersList();
      return (response || []).map(transformUser);
    },
  });
}

/**
 * Custom Hook truy xuất dòng hoạt động gần đây thật của hệ thống.
 */
export function useAdminActivityQuery() {
  return useQuery({
    queryKey: ['adminActivity'],
    queryFn: async () => {
      const response = await adminService.getRecentActivity(10);
      return response || [];
    },
  });
}

/**
 * Custom Hook truy xuất danh sách các báo cáo vi phạm (dữ liệu thật).
 */
export function useAdminReportsQuery(
  status: 'pending' | 'resolved' | 'dismissed' | 'all' = 'pending'
) {
  return useQuery({
    queryKey: ['adminReports', status],
    queryFn: async () => {
      const response = await adminService.getReportedContent(status);
      return (response || []).map(transformReport);
    },
  });
}

/**
 * Custom Hook duyệt hoặc từ chối kiểm duyệt ảnh.
 */
export function useModeratePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      photoId,
      status,
    }: {
      photoId: string | number;
      status: 'approved' | 'rejected';
    }) => {
      return adminService.moderatePhoto(photoId, status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminPendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] }); // Làm mới cả danh sách ảnh ngoài feed/trending
      
      const actionName = variables.status === 'approved' ? 'Phê duyệt' : 'Từ chối';
      toast.success(`${actionName} ảnh thành công!`);
    },
    onError: (error: any) => {
      toast.error('Kiểm duyệt ảnh thất bại', {
        description: error.message || 'Có lỗi xảy ra khi cập nhật trạng thái ảnh.',
      });
    },
  });
}

/**
 * Custom Hook khóa hoặc mở khóa tài khoản người dùng.
 */
export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      status,
    }: {
      userId: string | number;
      status: 'active' | 'banned';
    }) => {
      return adminService.updateUserStatus(userId, status);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      
      const actionName = variables.status === 'active' ? 'Mở khóa' : 'Khóa';
      toast.success(`${actionName} tài khoản thành công!`);
    },
    onError: (error: any) => {
      toast.error('Cập nhật trạng thái người dùng thất bại', {
        description: error.message || 'Có lỗi xảy ra, vui lòng thử lại.',
      });
    },
  });
}

/**
 * Custom Hook bỏ qua (dismiss) phiếu báo cáo — giữ nguyên nội dung.
 */
export function useDeleteReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string | number) => {
      return adminService.deleteReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      toast.success('Đã bỏ qua báo cáo.');
    },
    onError: (error: any) => {
      toast.error('Bỏ qua báo cáo thất bại', {
        description: error.message || 'Có lỗi xảy ra khi xử lý báo cáo.',
      });
    },
  });
}

/**
 * Custom Hook xử lý báo cáo: gỡ bỏ nội dung vi phạm (ảnh hoặc bình luận).
 */
export function useResolveReportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string | number) => {
      return adminService.resolveReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminStats'] });
      queryClient.invalidateQueries({ queryKey: ['adminPendingPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast.success('Đã gỡ bỏ nội dung vi phạm.');
    },
    onError: (error: any) => {
      toast.error('Xử lý báo cáo thất bại', {
        description: error.message || 'Có lỗi xảy ra khi gỡ bỏ nội dung.',
      });
    },
  });
}
