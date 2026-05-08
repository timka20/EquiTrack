import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { NotificationBanner } from '@/components/notifications/NotificationBanner';
import { useAuthStore } from '@/store/useAuthStore';

export function MainLayout() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background safe-area-top safe-area-bottom">
      <Header />
      {isAuthenticated && <NotificationBanner />}
      <main className="pb-20">
        <Outlet />
      </main>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}
