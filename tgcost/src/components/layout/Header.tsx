import { Bell, MapPin, Loader2, Check, Trash2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/useAuthStore';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationsStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [location, setLocation] = useState<string>('Москва');
  const [isLocating, setIsLocating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (!user) return;

    const detectLocation = () => {
      setIsLocating(true);

      if (!navigator.geolocation) {
        setLocation('Геолокация не поддерживается');
        setIsLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {

            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10&accept-language=ru`
            );
            const data = await response.json();

            const city = data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.state ||
                        'Неизвестно';

            setLocation(city);
            localStorage.setItem('tgcost_location', city);
          } catch (error) {
            console.error('Geocoding error:', error);
            setLocation('Не удалось определить');
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);

          const saved = localStorage.getItem('tgcost_location');
          setLocation(saved || 'Москва');
          setIsLocating(false);
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    };

    const savedLocation = localStorage.getItem('tgcost_location');
    if (savedLocation) {
      setLocation(savedLocation);
    } else {
      detectLocation();
    }
  }, [user]);

  const handleLocationClick = () => {
    toast({
      title: 'Местоположение',
      description: location,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'material': return '🎨';
      case 'platform': return '📍';
      default: return '📢';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} час назад`;
    if (days === 1) return 'вчера';
    return `${days} дней назад`;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg safe-area-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-bold text-foreground">TGCost</h1>
          {user && (
            <button
              onClick={handleLocationClick}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLocating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <MapPin className="h-3 w-3" />
              )}
              <span className="max-w-[150px] truncate">{location}</span>
            </button>
          )}
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>

          <AnimatePresence>
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border bg-card p-2 shadow-elevated"
                >
                  <div className="mb-2 flex items-center justify-between px-2 py-1">
                    <h3 className="text-sm font-semibold">Уведомления</h3>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs text-primary hover:underline"
                      >
                        Прочитать все
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                    className="w-full flex items-center justify-between px-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors border-b border-border mb-2"
                  >
                    <span>Все уведомления</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <div className="max-h-80 space-y-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Нет уведомлений</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => markAsRead(notification.id)}
                          className={cn(
                            'rounded-xl p-3 transition-colors hover:bg-muted cursor-pointer',
                            !notification.read && 'bg-primary/5'
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{notification.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                              <p className="mt-1 text-[10px] text-muted-foreground">{formatTime(notification.createdAt)}</p>
                            </div>
                            {!notification.read && (
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
