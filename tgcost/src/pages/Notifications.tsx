import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  Trash2,
  Package,
  Calendar,
  Info,
  Building2,
  ChevronRight,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationsStore } from '@/store/useNotificationsStore';
import { formatDistanceToNow } from '@/lib/utils';
import { toast } from 'sonner';

export default function Notifications() {
  const {
    notifications,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotificationsStore();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast.success('Все уведомления отмечены как прочитанные');
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await deleteNotification(id);
    setDeletingId(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'material':
        return <Package className="h-5 w-5 text-yellow-500" />;
      case 'platform':
        return <Building2 className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-primary" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-muted/50';
    switch (type) {
      case 'booking':
        return 'bg-blue-50 dark:bg-blue-950/30';
      case 'material':
        return 'bg-yellow-50 dark:bg-yellow-950/30';
      case 'platform':
        return 'bg-green-50 dark:bg-green-950/30';
      default:
        return 'bg-primary/5';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Уведомления</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} непрочитанных`
                  : 'Все уведомления прочитаны'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Все прочитано
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-140px)]">
        <div className="px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground mt-4">Загрузка уведомлений...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">Нет уведомлений</p>
              <p className="text-sm text-muted-foreground">
                Здесь будут появляться важные события
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`
                    relative rounded-xl border p-4 transition-colors
                    ${getBgColor(notification.type, notification.read)}
                    ${!notification.read ? 'border-l-4 border-l-primary' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-semibold text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatDistanceToNow(notification.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Прочитано
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-destructive hover:text-destructive"
                          onClick={() => handleDelete(notification.id)}
                          disabled={deletingId === notification.id}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
