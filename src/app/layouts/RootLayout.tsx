import { useEffect, useState } from 'react';
import { Outlet, useNavigation } from 'react-router';
import { Header } from '../components/Header';
import { AuthModalProvider } from '../contexts/AuthModalContext';

export default function RootLayout() {
  const navigation = useNavigation();
  const isPageLoading = navigation.state === 'loading';
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPageLoading) {
      setVisible(true);
      setProgress(15);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          const next = prev + Math.floor(Math.random() * 8) + 2;
          return next > 85 ? 85 : next;
        });
      }, 250);
    } else {
      if (progress > 0) {
        setProgress(100);
        const timeout = setTimeout(() => {
          setVisible(false);
          // Đợi hiệu ứng fade-out hoàn thành rồi mới reset progress về 0
          setTimeout(() => setProgress(0), 300);
        }, 300);
        return () => {
          clearTimeout(timeout);
          if (interval) clearInterval(interval);
        };
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPageLoading, progress]);

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors relative">
        {/* Thanh hiển thị tiến trình tải trang Premium */}
        <div 
          className={`fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 z-[9999] transition-all duration-300 ease-out ${
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(168, 85, 247, 0.7), 0 0 5px rgba(236, 72, 153, 0.5)'
          }}
        />
        <Header />
        <Outlet />
      </div>
    </AuthModalProvider>
  );
}

