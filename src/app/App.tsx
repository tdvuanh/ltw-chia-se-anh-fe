import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Khởi tạo QueryClient với cấu hình bộ nhớ đệm và xử lý lỗi toàn cục nâng cao
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any, query) => {
      // Bỏ qua lỗi check auth của currentUser để tránh hiển thị thông báo phiền nhiễu khi chưa đăng nhập
      if (query.queryKey[0] === 'currentUser') return;

      toast.error('Lỗi tải dữ liệu', {
        description: error.message || 'Không thể kết nối hoặc tải dữ liệu từ máy chủ.',
      });
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any, _variables, _context, mutation) => {
      // Chỉ hiển thị thông báo lỗi chung nếu mutation chưa có handler onError riêng biệt
      if (mutation.options.onError) return;

      toast.error('Thực hiện thất bại', {
        description: error.message || 'Đã có lỗi xảy ra, vui lòng thử lại.',
      });
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,    // 5 phút dữ liệu được giữ nguyên, tránh reload mạng dư thừa
      refetchOnWindowFocus: false, // Tránh tự động tải lại dữ liệu khi người dùng chuyển tab trình duyệt
      retry: 1,                    // Thử lại tối đa 1 lần nếu gặp lỗi đường truyền
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster closeButton richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}