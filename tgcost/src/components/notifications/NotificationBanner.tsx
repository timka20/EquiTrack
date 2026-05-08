import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Info, AlertTriangle, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from 'react-router-dom';

interface BannerNotification {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'material' | 'system' | 'platform';
  read: boolean;
  createdAt: string;
}

export function NotificationBanner() {
  const { isAuthenticated } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead, unreadCount } = useNotificationsStore();
  const [currentBanner, setCurrentBanner] = useState<BannerNotification | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('tgcost_dismissed_banners');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    const unreadNotifications = notifications.filter(
      n => !n.read && !dismissedIds.has(n.id)
    );

    if (unreadNotifications.length > 0 && !currentBanner) {

      setCurrentBanner(unreadNotifications[0]);
    }
  }, [notifications, dismissedIds, currentBanner]);

  const handleDismiss = () => {
    if (currentBanner) {
      const newDismissed = new Set(dismissedIds);
      newDismissed.add(currentBanner.id);
      setDismissedIds(newDismissed);
      localStorage.setItem('tgcost_dismissed_banners', JSON.stringify([...newDismissed]));
      setCurrentBanner(null);
    }
  };

  const handleMarkAsRead = async () => {
    if (currentBanner) {
      await markAsRead(currentBanner.id);
      handleDismiss();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Bell className="h-5 w-5 text-blue-600" />;
      case 'material':
        return <Info className="h-5 w-5 text-amber-600" />;
      case 'platform':
        return <Check className="h-5 w-5 text-green-600" />;
      default:
        return <Info className="h-5 w-5 text-slate-600" />;
    }
  };

  const getBgStyles = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 border-blue-300 shadow-blue-200';
      case 'material':
        return 'bg-amber-100 border-amber-300 shadow-amber-200';
      case 'platform':
        return 'bg-green-100 border-green-300 shadow-green-200';
      default:
        return 'bg-slate-100 border-slate-300 shadow-slate-200';
    }
  };

  if (!isAuthenticated || !currentBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-md"
      >
        <div
          className={`
            relative rounded-xl border-2 p-4 shadow-xl backdrop-blur-sm
            ${getBgStyles(currentBanner.type)}
          `}
        >
          {}
          <div className="absolute inset-0 rounded-xl bg-white/90 -z-10" />

          <div className="flex items-start gap-3 relative">
            <div className={`
              shrink-0 w-10 h-10 rounded-full flex items-center justify-center
              ${currentBanner.type === 'booking' ? 'bg-blue-200' : ''}
              ${currentBanner.type === 'material' ? 'bg-amber-200' : ''}
              ${currentBanner.type === 'platform' ? 'bg-green-200' : ''}
              ${currentBanner.type === 'system' ? 'bg-slate-200' : ''}
            `}>
              {getIcon(currentBanner.type)}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-slate-900">{currentBanner.title}</h4>
              <p className="text-sm text-slate-700 mt-1 line-clamp-2">
                {currentBanner.message}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  className="h-8 text-xs bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 shadow-sm"
                  onClick={handleMarkAsRead}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Прочитано
                </Button>
                <Link to="/notifications" onClick={handleDismiss}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-slate-700 hover:text-slate-900 hover:bg-white/50"
                  >
                    Все уведомления
                  </Button>
                </Link>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-8 w-8 -mt-1 -mr-1 text-slate-500 hover:text-slate-900 hover:bg-white/60"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
