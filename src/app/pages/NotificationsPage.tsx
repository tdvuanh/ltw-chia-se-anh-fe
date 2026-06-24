import { useState } from 'react';
import { Link } from 'react-router';
import { Heart, MessageCircle, UserPlus, Bell, CheckCheck, Loader2 } from 'lucide-react';
import {
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllReadMutation,
} from '../api';

const TYPE_ICON: Record<string, any> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
};

const TYPE_COLOR: Record<string, string> = {
  like: 'text-red-500',
  comment: 'text-blue-500',
  follow: 'text-purple-500',
};

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { data: notifications = [], isLoading } = useNotificationsQuery(filter === 'unread');
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllReadMutation();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Thông Báo</h1>
              <p className="text-gray-600 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Bạn đã xem hết thông báo'}
              </p>
            </div>
          </div>
          <button
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5 border-b dark:border-gray-800">
          {(['all', 'unread'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 border-b-2 transition-colors ${
                filter === f
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-semibold'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {f === 'all' ? 'Tất cả' : 'Chưa đọc'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || Bell;
              const color = TYPE_COLOR[n.type] || 'text-gray-500';
              const target = n.photoId ? `/photo/${n.photoId}` : n.actorId ? `/profile/${n.actorName}/${n.actorId}` : '#';
              return (
                <Link
                  key={n.id}
                  to={target}
                  onClick={() => { if (!n.isRead) markRead.mutate(n.id); }}
                  className={`flex items-start gap-3 p-4 rounded-lg border transition-colors ${
                    n.isRead
                      ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                      : 'bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40'
                  } hover:shadow-sm`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white overflow-hidden flex-shrink-0">
                    {n.actorAvatar ? (
                      <img src={n.actorAvatar} alt={n.actorName} className="w-full h-full object-cover" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 dark:text-white">
                      <span className="font-semibold">{n.actorName}</span>{' '}
                      <span className="text-gray-600 dark:text-gray-300">{n.message}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                    </p>
                  </div>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                  {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-purple-500 flex-shrink-0 mt-1.5"></span>}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Khi có người thích ảnh, bình luận hoặc theo dõi bạn, thông báo sẽ xuất hiện tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
