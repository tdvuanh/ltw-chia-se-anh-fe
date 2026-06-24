import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { useVerifyEmailMutation } from '../../api';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const verifyEmailMutation = useVerifyEmailMutation();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (token && !attempted) {
      setAttempted(true);
      verifyEmailMutation.mutate(token);
    }
  }, [token, attempted, verifyEmailMutation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors duration-200">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-[80px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-md w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden p-8 text-center transition-colors duration-200 z-10">
        {!token ? (
          /* Error State: Missing Token */
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Thiếu mã xác thực</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Mã bảo mật (Token) xác minh tài khoản của bạn bị thiếu. Vui lòng nhấp lại vào liên kết trong hộp thư của bạn.
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
        ) : verifyEmailMutation.isPending ? (
          /* Loading State: Verifying */
          <div className="py-8">
            <Loader2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-extrabold text-foreground">Đang xác minh tài khoản</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Vui lòng chờ giây lát, hệ thống đang xử lý và kích hoạt tài khoản của bạn...
            </p>
          </div>
        ) : verifyEmailMutation.isSuccess ? (
          /* Success State: Account Verified */
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Xác minh thành công!</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Chào mừng! Địa chỉ email của bạn đã được xác minh thành công. Tài khoản đã sẵn sàng hoạt động.
            </p>
            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-200 cursor-pointer"
              >
                Đăng nhập ngay
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Error State: Verification Failed */
          <div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-full mb-6">
              <XCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Xác minh thất bại</h2>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {verifyEmailMutation.error instanceof Error
                ? verifyEmailMutation.error.message
                : (verifyEmailMutation.error as any)?.message ||
                  'Mã xác thực của bạn không hợp lệ, đã hết hạn hoặc đã được sử dụng.'}
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
        )}
      </div>
    </div>
  );
}
