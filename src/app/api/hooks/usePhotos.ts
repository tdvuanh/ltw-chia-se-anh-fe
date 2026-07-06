import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { photoService } from '../services/photoService';
import { transformPhoto, transformComment } from '../transformers';
import { toast } from 'sonner';
import { UploadPhotoPayload } from '../types';

/**
 * Custom Hook quản lý dữ liệu danh sách ảnh thịnh hành và sắp xếp động.
 * Đóng gói tự động bộ đệm Cache, ánh xạ Transformers và phân tách luồng hiển thị.
 */
export function usePhotosQuery(activeTab: 'latest' | 'popular' = 'latest') {
  const query = useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const response = await photoService.getPhotos(1, 100);
      return response;
    },
    select: (response) => {
      const rawPhotos = response?.photos || [];
      const transformed = rawPhotos.map(transformPhoto);

      // Sắp xếp động client-side tùy thuộc vào Tab hoạt động để tăng tốc UI mượt mà
      if (activeTab === 'popular') {
        // Thuật toán xu hướng: điểm = lượt thích / (giờ_tuổi + 2)^1.5
        // (kiểu Hacker News) → kết hợp độ phổ biến và độ mới, tránh ảnh cũ "đóng đinh" top
        const now = Date.now();
        const score = (p: typeof transformed[number]) => {
          const ageHours = Math.max(0, (now - new Date(p.created_at).getTime()) / 3_600_000);
          return (p.likes + 1) / Math.pow(ageHours + 2, 1.5);
        };
        return [...transformed].sort((a, b) => score(b) - score(a));
      } else {
        return [...transformed].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    },
  });

  return {
    photos: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Custom Hook cho trang Khám Phá: lấy toàn bộ ảnh và sắp xếp theo tab.
 *  - trending/top: theo lượt thích giảm dần
 *  - fresh: theo thời gian đăng mới nhất
 *  - editors: theo lượt xem giảm dần (fallback lượt thích)
 */
export function useExplorePhotosQuery(tab: 'trending' | 'fresh' | 'top' | 'editors' = 'trending') {
  const query = useQuery({
    queryKey: ['photos'],
    queryFn: async () => photoService.getPhotos(1, 100),
    select: (response) => {
      const transformed = (response?.photos || []).map(transformPhoto);
      const sorted = [...transformed];
      const now = Date.now();
      const trendScore = (p: typeof transformed[number]) => {
        const ageHours = Math.max(0, (now - new Date(p.created_at).getTime()) / 3_600_000);
        return (p.likes + 1) / Math.pow(ageHours + 2, 1.5);
      };
      if (tab === 'fresh') {
        sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (tab === 'editors') {
        sorted.sort((a, b) => (b.views || 0) - (a.views || 0) || b.likes - a.likes);
      } else if (tab === 'top') {
        // Hàng đầu: lượt thích toàn thời gian
        sorted.sort((a, b) => b.likes - a.likes);
      } else {
        // Xu hướng: điểm trending theo thời gian (recency + likes)
        sorted.sort((a, b) => trendScore(b) - trendScore(a));
      }
      return sorted;
    },
  });

  return {
    photos: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Custom Hook lấy danh sách ảnh đã thích của người dùng hiện tại.
 */
export function useFavoritePhotosQuery() {
  return useQuery({
    queryKey: ['favoritePhotos'],
    queryFn: async () => {
      const response = await photoService.getLikedPhotos(1, 100);
      return (response?.photos || []).map(transformPhoto);
    },
  });
}

/**
 * Custom Hook truy xuất chi tiết ảnh cụ thể.
 */
export function usePhotoDetailQuery(id: string | number) {
  return useQuery({
    queryKey: ['photo', String(id)],
    queryFn: async () => {
      const response = await photoService.getPhotoDetail(id);
      return transformPhoto(response.photo);
    },
    enabled: !!id,
  });
}

/**
 * Custom Hook truy xuất danh sách bình luận của bức ảnh cụ thể.
 */
export function usePhotoCommentsQuery(photoId: string | number) {
  return useQuery({
    queryKey: ['comments', String(photoId)],
    queryFn: async () => {
      const response = await photoService.getComments(photoId, 1, 100);
      const rawComments = response?.comments || [];
      return rawComments.map(transformComment);
    },
    enabled: !!photoId,
  });
}

/**
 * Custom Hook đăng bình luận mới dưới bức ảnh.
 */
export function useAddCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, content }: { photoId: string | number; content: string }) => {
      return photoService.addComment(photoId, content);
    },
    onSuccess: (data, variables) => {
      // Làm mới cache bình luận của ảnh này
      queryClient.invalidateQueries({ queryKey: ['comments', String(variables.photoId)] });
      // Làm mới cache chi tiết ảnh này (để cập nhật lại comments_count)
      queryClient.invalidateQueries({ queryKey: ['photo', String(variables.photoId)] });
      toast.success('Đăng bình luận thành công!');
    },
    onError: (error: any) => {
      toast.error('Đăng bình luận thất bại', {
        description: error.message || 'Có lỗi xảy ra khi gửi bình luận.',
      });
    },
  });
}

/**
 * Custom Hook xóa một bình luận của bạn hoặc nếu bạn là quản trị viên/chủ ảnh.
 */
export function useDeleteCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId }: { commentId: string | number; photoId: string | number }) => {
      return photoService.deleteComment(commentId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', String(variables.photoId)] });
      queryClient.invalidateQueries({ queryKey: ['photo', String(variables.photoId)] });
      toast.success('Đã xóa bình luận thành công.');
    },
    onError: (error: any) => {
      toast.error('Xóa bình luận thất bại', {
        description: error.message || 'Bạn không thể xóa bình luận này.',
      });
    },
  });
}

/**
 * Custom Hook quản lý hành vi Thích/Bỏ thích ảnh bất đồng bộ.
 * Tự động làm mới cache ảnh ['photos'] và chi tiết ảnh ['photo'] ngay khi tương tác thành công.
 */
export function useToggleLikeMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, isLiked }: { id: string | number; isLiked: boolean }) => {
      if (isLiked) {
        return photoService.unlikePhoto(id);
      } else {
        return photoService.likePhoto(id);
      }
    },
    onSuccess: (data, variables) => {
      // Làm mới dữ liệu ảnh toàn cục để cập nhật lượt thích mới từ server Vercel
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      queryClient.invalidateQueries({ queryKey: ['photo', String(variables.id)] });
      queryClient.invalidateQueries({ queryKey: ['searchPhotos'] });
      queryClient.invalidateQueries({ queryKey: ['favoritePhotos'] });
      queryClient.invalidateQueries({ queryKey: ['userPhotos'] });
    },
  });

  return {
    toggleLike: (id: string | number, isLiked: boolean) => mutation.mutate({ id, isLiked }),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Custom Hook tìm kiếm ảnh.
 */
export function useSearchPhotosQuery(query: string) {
  return useQuery({
    queryKey: ['searchPhotos', query],
    queryFn: async () => {
      if (!query.trim()) return { photos: [] };
      return photoService.searchPhotos(query, 1, 100);
    },
    select: (response) => {
      const rawPhotos = response?.photos || [];
      return rawPhotos.map(transformPhoto);
    },
    enabled: !!query.trim(),
  });
}

/**
 * Custom Hook đăng tải ảnh mới.
 */
export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UploadPhotoPayload) => {
      return photoService.uploadPhoto(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast.success('Đăng ảnh thành công!');
    },
    onError: (error: any) => {
      toast.error('Đăng ảnh thất bại', {
        description: error.message || 'Có lỗi xảy ra khi tải ảnh lên.',
      });
    },
  });
}


