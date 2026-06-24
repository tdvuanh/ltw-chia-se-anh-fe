import { useEffect, useRef, useState } from 'react';
import { User, Mail, Lock, Bell, Eye, Globe, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  useCurrentUserQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useChangePasswordMutation,
} from '../api';

export default function AccountSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'privacy' | 'notifications'>('profile');

  const { data: currentUser, isLoading: isLoadingUser } = useCurrentUserQuery();
  const updateProfile = useUpdateProfileMutation();
  const uploadAvatar = useUploadAvatarMutation();
  const changePassword = useChangePasswordMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form hồ sơ
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');

  // Form đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Khởi tạo form từ dữ liệu người dùng khi tải xong
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.full_name || currentUser.displayName || '');
      setBio(currentUser.bio || '');
    }
  }, [currentUser]);

  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatar_url || '';
  const displayInitial = (currentUser?.full_name || currentUser?.username || 'U').substring(0, 1).toUpperCase();

  const handleSaveProfile = () => {
    if (!currentUser?.id) return;
    updateProfile.mutate({
      userId: currentUser.id,
      data: { full_name: fullName.trim(), bio: bio.trim() },
    });
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Tệp không hợp lệ', { description: 'Vui lòng chọn một tệp ảnh.' });
      return;
    }
    uploadAvatar.mutate(file);
    e.target.value = '';
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Mật khẩu quá ngắn', { description: 'Mật khẩu mới cần tối thiểu 8 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu không khớp', { description: 'Xác nhận mật khẩu chưa trùng khớp.' });
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword, confirmPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
      }
    );
  };

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Cài Đặt Tài Khoản</h1>
          <p className="text-gray-600 dark:text-gray-400">Quản lý thông tin và tùy chọn tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-2">
              {[
                { key: 'profile', label: 'Hồ Sơ', icon: User },
                { key: 'account', label: 'Tài Khoản', icon: Lock },
                { key: 'privacy', label: 'Quyền Riêng Tư', icon: Eye },
                { key: 'notifications', label: 'Thông Báo', icon: Bell },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === key
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thông Tin Hồ Sơ</h2>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Ảnh Đại Diện
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                          displayInitial
                        )}
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <button
                          onClick={handleAvatarClick}
                          disabled={uploadAvatar.isPending}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 flex items-center gap-2"
                        >
                          {uploadAvatar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                          {uploadAvatar.isPending ? 'Đang tải...' : 'Thay Đổi Ảnh'}
                        </button>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, PNG tối đa 10MB</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Tên Người Dùng
                    </label>
                    <input
                      type="text"
                      value={currentUser?.username || ''}
                      disabled
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Tên đăng nhập không thể thay đổi.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Tên Hiển Thị
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Tên hiển thị của bạn"
                      maxLength={100}
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Tiểu Sử
                    </label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Giới thiệu đôi nét về bạn..."
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={updateProfile.isPending}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-300 flex items-center gap-2"
                  >
                    {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {updateProfile.isPending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cài Đặt Tài Khoản</h2>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </div>
                    </label>
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <form onSubmit={handleChangePassword} className="border-t dark:border-gray-700 pt-6 space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Đổi Mật Khẩu
                      </div>
                    </h3>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Mật Khẩu Hiện Tại
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Mật Khẩu Mới
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Tối thiểu 8 ký tự"
                        className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Xác Nhận Mật Khẩu Mới
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changePassword.isPending || !currentPassword || !newPassword}
                      className="px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:bg-gray-300 flex items-center gap-2"
                    >
                      {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      {changePassword.isPending ? 'Đang đổi...' : 'Cập Nhật Mật Khẩu'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quyền Riêng Tư</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Các tùy chọn hiển thị (minh hoạ giao diện).</p>
                  <div className="space-y-4">
                    {[
                      { icon: Globe, title: 'Hồ Sơ Công Khai', desc: 'Cho phép mọi người xem hồ sơ của bạn', on: true },
                      { icon: Eye, title: 'Hiển Thị Thống Kê', desc: 'Hiển thị lượt xem và thống kê trên ảnh', on: true },
                      { icon: Shield, title: 'Cho Phép Tải Xuống', desc: 'Cho phép người khác tải xuống ảnh của bạn', on: false },
                    ].map(({ icon: Icon, title, desc, on }) => (
                      <div key={title} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
                        <div>
                          <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-1">
                            <Icon className="w-5 h-5" />
                            {title}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={on} />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cài Đặt Thông Báo</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tùy chọn nhận thông báo (minh hoạ giao diện).</p>
                  <div className="space-y-4">
                    {[
                      { title: 'Lượt Thích', desc: 'Nhận thông báo khi ai đó thích ảnh của bạn', on: true },
                      { title: 'Bình Luận', desc: 'Nhận thông báo khi có bình luận mới', on: true },
                      { title: 'Người Theo Dõi Mới', desc: 'Nhận thông báo khi có người theo dõi mới', on: true },
                      { title: 'Email Marketing', desc: 'Nhận email về ưu đãi và tin tức', on: false },
                    ].map(({ title, desc, on }) => (
                      <div key={title} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white mb-1">{title}</div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked={on} />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
