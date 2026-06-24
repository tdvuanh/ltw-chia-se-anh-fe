import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useForgotPasswordMutation } from '../../api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotPasswordMutation = useForgotPasswordMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      forgotPasswordMutation.mutate(email, {
        onSuccess: () => {
          setIsSubmitted(true);
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors duration-200">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-md w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden p-8 transition-colors duration-200 z-10">
        {isSubmitted ? (
          /* Success Screen */
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Kiểm tra hộp thư</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Chúng tôi đã gửi một liên kết khôi phục mật khẩu đến địa chỉ email <strong className="text-foreground">{email}</strong>.
            </p>
            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
              >
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          /* Request Form */
          <div>
            <div className="mb-8">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
              </Link>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Quên mật khẩu</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Nhập email của bạn và chúng tôi sẽ gửi liên kết khôi phục mật khẩu.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-foreground">
                  Địa chỉ Email của bạn
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ten@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/30 text-foreground transition-all duration-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 disabled:from-purple-600/60 disabled:to-pink-600/60 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {forgotPasswordMutation.isPending ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Gửi mã xác nhận'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
