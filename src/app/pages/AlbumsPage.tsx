import { Link } from 'react-router';
import { Folder, Images } from 'lucide-react';

export default function AlbumsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Folder className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Album Của Tôi</h1>
              <p className="text-gray-600 dark:text-gray-400">Sắp xếp ảnh thành bộ sưu tập</p>
            </div>
          </div>
        </div>

        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <Images className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Tính năng Album đang được phát triển
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Hiện bạn có thể xem toàn bộ ảnh đã đăng trong trang cá nhân và lưu ảnh yêu thích.
          </p>
          <Link
            to="/favorites"
            className="inline-block px-6 py-2.5 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Tới Ảnh Yêu Thích
          </Link>
        </div>
      </div>
    </div>
  );
}
