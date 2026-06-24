import { useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useResetPasswordMutation } from '../../api';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetPasswordMutation = useResetPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token không tồn tại', {
        description: 'Liên kết đặt lại mật khẩu của bạn không hợp lệ hoặc thiếu token.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu không khớp', {
        description: 'Vui lòng xác nhận mật khẩu giống nhau.',
      });
      return;
    }
    resetPasswordMutation.mutate({
      token,
      newPassword,
      confirmPassword,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors duration-200">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-md w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden p-8 transition-colors duration-200 z-10">
        <div className="mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại đăng nhập
          </Link>
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Đặt lại mật khẩu</h2>
          <p className="text-sm text-muted-foreground mt-2">Nhập mật khẩu mới của bạn bên dưới.</p>
        </div>

        {!token ? (
          <div className="text-center py-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30 rounded-lg p-6">
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
              Mã bảo mật (Token) bị thiếu hoặc không đúng định dạng. Vui lòng kiểm tra lại liên kết trong email của bạn.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-foreground transition-all duration-200"
                />
              </div>
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-foreground">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-foreground transition-all duration-200"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 disabled:from-purple-600/60 disabled:to-pink-600/60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {resetPasswordMutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
