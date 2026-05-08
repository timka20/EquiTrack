import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Settings,
  Heart,
  Calendar,
  Building2,
  LogOut,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Eye,
  MapPin,
  FileImage,
  Upload,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Package,
  Star,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/useAuthStore';
import { useBookingsStore, type Booking } from '@/store/useBookingsStore';
import { api } from '@/services/api';
import { toast } from 'sonner';

function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return `${count} ${few}`;
  return `${count} ${many}`;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { bookings, fetchBookings, cancelBooking, isLoading: bookingsLoading, uploadMaterial } = useBookingsStore();

  const [activeTab, setActiveTab] = useState<'bookings' | 'platforms' | 'requests'>('bookings');
  const [isLoading, setIsLoading] = useState(true);
  const [myPlatforms, setMyPlatforms] = useState<any[]>([]);
  const [platformBookings, setPlatformBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAddPlatform, setShowAddPlatform] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    loadData();
  }, [isAuthenticated, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await fetchBookings();

      if (user?.role === 'owner') {
        const platforms = await api.getMyPlatforms();
        setMyPlatforms(platforms);

        const allBookings: any[] = [];
        for (const platform of platforms) {
          try {
            const bookings = await api.getPlatformBookings(platform.id);
            allBookings.push(...bookings.map((b: any) => ({ ...b, platformName: platform.name, platformImage: platform.image })));
          } catch (e) {
            console.error('Failed to load bookings for platform:', platform.id);
          }
        }
        setPlatformBookings(allBookings);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleFileUpload = async (bookingId: string, file: File) => {
    setIsUploading(true);
    try {
      await uploadMaterial(bookingId, file);
      await loadData();
      const updated = bookings.find(b => b.id === bookingId);
      if (updated) {
        setSelectedBooking(updated);
      }
      toast.success('Макет успешно загружен');
    } catch (error) {
      toast.error('Ошибка загрузки макета');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.updateBookingStatus(bookingId, status);
      await loadData();
      toast.success('Статус бронирования обновлён');
    } catch (error) {
      toast.error('Ошибка обновления статуса');
    }
  };

  const handleApproveMaterial = async (bookingId: string) => {
    try {
      await api.approveMaterial(bookingId);
      await loadData();
      toast.success('Макет одобрен');
    } catch (error) {
      toast.error('Ошибка при одобрении макета');
    }
  };

  const handleRejectMaterial = async (bookingId: string, reason: string) => {
    try {
      await api.rejectMaterial(bookingId, reason);
      await loadData();
      toast.success('Макет отклонён');
    } catch (error) {
      toast.error('Ошибка при отклонении макета');
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const isOwner = user.role === 'owner';
  const isAdvertiser = user.role === 'advertiser';

  const totalEarnings = platformBookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const pendingRequests = platformBookings.filter(b => b.status === 'pending').length;
  const activePlatforms = myPlatforms.filter(p => p.available).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero px-4 pb-6 pt-4"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="secondary" className="mt-1">
              {user.role === 'advertiser' && '📢 Рекламодатель'}
              {user.role === 'owner' && '🏢 Владелец площадок'}
              {user.role === 'moderator' && '🛡️ Модератор'}
              {user.role === 'admin' && '⚙️ Админ'}
            </Badge>
          </div>
        </div>

        {}
        {isOwner && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <StatCard
              icon={<DollarSign className="h-4 w-4" />}
              value={`${totalEarnings.toLocaleString()} ₽`}
              label="Заработано"
            />
            <StatCard
              icon={<Package className="h-4 w-4" />}
              value={String(myPlatforms.length)}
              label="Площадок"
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              value={String(pendingRequests)}
              label="Заявок"
            />
          </div>
        )}
      </motion.div>

      {}
      <div className="border-b border-border px-4 py-4">
        <div className={`grid gap-3 ${isOwner ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <QuickAction icon={<Heart className="h-5 w-5" />} label="Избранное" onClick={() => navigate('/favorites')} />
          <QuickAction icon={<Calendar className="h-5 w-5" />} label={isOwner ? "Мои заявки" : "Бронирования"} onClick={() => setActiveTab('bookings')} />
          {isOwner && (
            <QuickAction icon={<Building2 className="h-5 w-5" />} label="Мои площадки" onClick={() => setActiveTab('platforms')} />
          )}
          <QuickAction icon={<Settings className="h-5 w-5" />} label="Настройки" onClick={() => navigate('/settings')} />
        </div>
      </div>

      {}
      <div className="border-b border-border">
        <div className="flex">
          <TabButton
            active={activeTab === 'bookings'}
            onClick={() => setActiveTab('bookings')}
            label={isOwner ? `Мои бронирования (${bookings.length})` : `Бронирования (${bookings.length})`}
          />
          {isOwner && (
            <>
              <TabButton
                active={activeTab === 'requests'}
                onClick={() => setActiveTab('requests')}
                label={`Заявки на площадки (${platformBookings.length})`}
              />
              <TabButton
                active={activeTab === 'platforms'}
                onClick={() => setActiveTab('platforms')}
                label={`Мои площадки (${myPlatforms.length})`}
              />
            </>
          )}
        </div>
      </div>

      {}
      <div className="p-4">
        {isLoading || bookingsLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Загрузка...</p>
          </div>
        ) : (
          <>
            {}
            {activeTab === 'bookings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {bookings.length > 0 ? (
                  bookings.map((booking: Booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancel={() => cancelBooking(booking.id)}
                      canCancel={booking.status === 'pending' || booking.status === 'confirmed'}
                      onClick={() => setSelectedBooking(booking)}
                      isAdvertiser={true}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={<Calendar className="h-8 w-8" />}
                    title="Нет бронирований"
                    description="Забронируйте площадку для рекламы"
                    action={<Button onClick={() => navigate('/search')}>Найти площадку</Button>}
                  />
                )}
              </motion.div>
            )}

            {}
            {activeTab === 'requests' && isOwner && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {platformBookings.length > 0 ? (
                  platformBookings.map((booking: any) => (
                    <OwnerBookingCard
                      key={booking.id}
                      booking={booking}
                      onApprove={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                      onReject={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                      onApproveMaterial={() => handleApproveMaterial(booking.id)}
                      onRejectMaterial={(reason) => handleRejectMaterial(booking.id, reason)}
                      onClick={() => setSelectedBooking(booking)}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={<Package className="h-8 w-8" />}
                    title="Нет заявок"
                    description="Пока никто не бронировал ваши площадки"
                  />
                )}
              </motion.div>
            )}

            {}
            {activeTab === 'platforms' && isOwner && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button
                  className="mb-4 w-full"
                  onClick={() => navigate('/upload-material')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить площадку
                </Button>
                <div className="space-y-3">
                  {myPlatforms.length > 0 ? (
                    myPlatforms.map((platform) => (
                      <div
                        key={platform.id}
                        onClick={() => setSelectedPlatform(platform)}
                        className="flex items-center gap-3 rounded-xl border border-border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <img
                          src={platform.image}
                          alt={platform.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">{platform.address}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={platform.available ? 'default' : 'secondary'}
                              className="text-[10px]"
                            >
                              {platform.available ? 'Активна' : 'Занята'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {platform.pricePerDay?.toLocaleString()} ₽/день
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    ))
                  ) : (
                    <EmptyState
                      icon={<Building2 className="h-8 w-8" />}
                      title="Нет площадок"
                      description="Добавьте свою первую рекламную площадку"
                      action={<Button onClick={() => navigate('/upload-material')}>Добавить площадку</Button>}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          {selectedBooking && (
            <BookingDetail
              booking={selectedBooking}
              onClose={() => setSelectedBooking(null)}
              onCancel={() => {
                cancelBooking(selectedBooking.id);
                setSelectedBooking(null);
              }}
              onUpload={handleFileUpload}
              isUploading={isUploading}
              isOwner={isOwner}
            />
          )}
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={!!selectedPlatform} onOpenChange={() => setSelectedPlatform(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedPlatform?.name}</DialogTitle>
          </DialogHeader>
          {selectedPlatform && (
            <div className="space-y-4">
              <img
                src={selectedPlatform.image}
                alt={selectedPlatform.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <p className="text-sm text-muted-foreground">{selectedPlatform.address}</p>
              <div className="flex items-center gap-2">
                <Badge variant={selectedPlatform.available ? 'default' : 'secondary'}>
                  {selectedPlatform.available ? 'Активна' : 'Занята'}
                </Badge>
                <span className="font-bold text-primary">
                  {selectedPlatform.pricePerDay?.toLocaleString()} ₽/день
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/platform/${selectedPlatform.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Просмотр
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedPlatform(null);
                    navigate(`/platform/${selectedPlatform.id}/edit`);
                  }}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Редактировать
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {}
      <div className="border-t border-border px-4 py-4">
        <MenuItem
          icon={<User className="h-5 w-5" />}
          label="Редактировать профиль"
          onClick={() => navigate('/profile/edit')}
        />
        {(user.role === 'admin' || user.role === 'moderator') && (
          <MenuItem
            icon={<Building2 className="h-5 w-5" />}
            label="Панель администратора"
            onClick={() => navigate('/admin')}
          />
        )}
        <MenuItem
          icon={<LogOut className="h-5 w-5" />}
          label="Выйти"
          onClick={handleLogout}
          destructive
        />
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white/50 rounded-xl p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-primary mb-1">
        {icon}
        <span className="font-bold text-sm">{value}</span>
      </div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted"
    >
      <div className="text-primary">{icon}</div>
      <span className="text-xs font-medium text-center leading-tight">{label}</span>
    </button>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 border-b-2 py-3 text-sm font-medium transition-colors whitespace-nowrap px-2 ${
        active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
      }`}
    >
      {label}
    </button>
  );
}

function MenuItem({ icon, label, onClick, destructive = false }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted ${
        destructive ? 'text-destructive' : ''
      }`}
    >
      {icon}
      <span className="flex-1 text-left text-sm">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </button>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel: () => void;
  canCancel: boolean;
  onClick: () => void;
  isAdvertiser?: boolean;
}

function BookingCard({ booking, onCancel, canCancel, onClick }: BookingCardProps) {
  const daysCount = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const displayPrice = booking.totalPrice && booking.totalPrice > 0
    ? booking.totalPrice
    : (booking.platformPrice || 0) * daysCount;

  return (
    <div
      className="rounded-xl border border-border p-4 cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
          {booking.platformImage ? (
            <img
              src={booking.platformImage}
              alt={booking.platformName}
              className="h-full w-full object-cover"
            />
          ) : (
            <Building2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{booking.platformName || 'Площадка'}</p>
          <p className="text-xs text-muted-foreground truncate">
            <MapPin className="h-3 w-3 inline mr-1" />
            {booking.platformAddress || 'Адрес не указан'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(booking.startDate).toLocaleDateString('ru-RU')} — {new Date(booking.endDate).toLocaleDateString('ru-RU')}
          </p>
          <p className="text-xs text-muted-foreground">
            {pluralize(daysCount, 'день', 'дня', 'дней')} · {displayPrice.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={booking.status} type="booking" />
        <StatusBadge status={booking.materialStatus} type="material" />
      </div>
    </div>
  );
}

interface OwnerBookingCardProps {
  booking: any;
  onApprove: () => void;
  onReject: () => void;
  onApproveMaterial: () => void;
  onRejectMaterial: (reason: string) => void;
  onClick: () => void;
}

function OwnerBookingCard({ booking, onApprove, onReject, onApproveMaterial, onRejectMaterial, onClick }: OwnerBookingCardProps) {
  const daysCount = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const [showRejectReason, setShowRejectReason] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex gap-3" onClick={onClick}>
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted overflow-hidden">
          {booking.platformImage ? (
            <img src={booking.platformImage} alt={booking.platformName} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{booking.platformName || 'Площадка'}</p>
          <p className="text-xs text-muted-foreground">Клиент: {booking.userName || 'Неизвестно'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(booking.startDate).toLocaleDateString('ru-RU')} — {new Date(booking.endDate).toLocaleDateString('ru-RU')}
          </p>
          <p className="text-xs font-medium text-primary mt-1">
            {(booking.totalPrice || 0).toLocaleString('ru-RU')} ₽ · {pluralize(daysCount, 'день', 'дня', 'дней')}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusBadge status={booking.status} type="booking" />
        <StatusBadge status={booking.materialStatus} type="material" />
      </div>

      {}
      {booking.status === 'pending' && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="default" className="flex-1 h-8" onClick={onApprove}>
            <CheckCircle className="h-4 w-4 mr-1" />
            Подтвердить
          </Button>
          <Button size="sm" variant="destructive" className="flex-1 h-8" onClick={onReject}>
            <XCircle className="h-4 w-4 mr-1" />
            Отклонить
          </Button>
        </div>
      )}

      {booking.materialStatus === 'pending' && booking.status === 'confirmed' && (
        <div className="space-y-2 mt-3">
          {!showRejectReason ? (
            <div className="flex gap-2">
              <Button size="sm" variant="default" className="flex-1 h-8" onClick={onApproveMaterial}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Одобрить макет
              </Button>
              <Button size="sm" variant="outline" className="flex-1 h-8" onClick={() => setShowRejectReason(true)}>
                <XCircle className="h-4 w-4 mr-1" />
                Отклонить
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                placeholder="Укажите причину отклонения..."
                className="w-full p-2 text-sm border rounded-md"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1 h-8"
                  onClick={() => {
                    onRejectMaterial(rejectReason);
                    setShowRejectReason(false);
                    setRejectReason('');
                  }}
                  disabled={!rejectReason.trim()}
                >
                  Отклонить макет
                </Button>
                <Button size="sm" variant="ghost" className="h-8" onClick={() => setShowRejectReason(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface BookingDetailProps {
  booking: Booking;
  onClose: () => void;
  onCancel: () => void;
  onUpload: (bookingId: string, file: File) => void;
  isUploading: boolean;
  isOwner?: boolean;
}

function BookingDetail({ booking, onClose, onCancel, onUpload, isUploading, isOwner }: BookingDetailProps) {
  const daysCount = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  const displayPrice = booking.totalPrice && booking.totalPrice > 0
    ? booking.totalPrice
    : (booking.platformPrice || 0) * daysCount;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Файл слишком большой (макс 10MB)');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(booking.id, selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canUpload = booking.materialStatus === 'none' || booking.materialStatus === 'rejected';

  return (
    <>
      <DialogHeader className="pb-2">
        <DialogTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          Детали бронирования
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-3 mt-2">
        {}
        <div className="flex gap-2 p-2 bg-muted/50 rounded-lg">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden">
            {booking.platformImage ? (
              <img src={booking.platformImage} alt={booking.platformName} className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{booking.platformName || 'Площадка'}</p>
            <p className="text-[10px] text-muted-foreground truncate">
              <MapPin className="h-3 w-3 inline mr-0.5" />
              {booking.platformCity && `${booking.platformCity}, `}
              {booking.platformAddress || 'Адрес не указан'}
            </p>
          </div>
        </div>

        {}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 bg-muted/30 rounded-md">
            <p className="text-[10px] text-muted-foreground">С {new Date(booking.startDate).toLocaleDateString('ru-RU')}</p>
            <p className="text-[10px] text-muted-foreground">По {new Date(booking.endDate).toLocaleDateString('ru-RU')}</p>
          </div>
          <div className="p-2 bg-muted/30 rounded-md">
            <p className="text-[10px] text-muted-foreground">{pluralize(daysCount, 'день', 'дня', 'дней')}</p>
            <p className="font-medium text-sm text-primary">{displayPrice.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        {}
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge status={booking.status} type="booking" />
          <StatusBadge status={booking.materialStatus} type="material" />
        </div>

        {}
        {booking.rejectionReason && (
          <div className="p-2 bg-destructive/10 rounded-md">
            <p className="text-[10px] text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {booking.rejectionReason}
            </p>
          </div>
        )}

        {}
        {!isOwner && canUpload && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Загрузка макета</p>

            {previewUrl ? (
              <div className="space-y-2">
                <img src={previewUrl} alt="Preview" className="max-h-32 rounded-lg object-contain mx-auto" />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}>
                    <X className="h-3 w-3 mr-1" />
                    Отмена
                  </Button>
                  <Button size="sm" className="flex-1 h-8 text-xs" onClick={handleUpload} disabled={isUploading}>
                    {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    Загрузить
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center gap-1 p-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileChange} />
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Нажмите чтобы выбрать файл</span>
                <span className="text-[10px] text-muted-foreground">JPG, PNG, PDF до 10MB</span>
              </label>
            )}
          </div>
        )}

        {}
        {booking.materialUrl && (
          <a
            href={booking.materialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-2 bg-muted/30 rounded-md text-sm text-primary hover:bg-muted/50 transition-colors"
          >
            <FileImage className="h-4 w-4" />
            Просмотреть макет
          </a>
        )}

        {}
        <div className="flex gap-2 pt-1">
          {!isOwner && canCancel && (
            <Button variant="destructive" size="sm" className="flex-1 h-9 text-xs" onClick={onCancel}>
              <Trash2 className="mr-1 h-3.5 w-3.5" />
              Отменить
            </Button>
          )}
          <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </>
  );
}

function StatusBadge({ status, type }: { status: string; type: 'booking' | 'material' }) {
  const configs = {
    booking: {
      pending: { label: 'Ожидает', icon: Clock, variant: 'secondary' as const },
      confirmed: { label: 'Подтверждено', icon: CheckCircle, variant: 'default' as const },
      completed: { label: 'Завершено', icon: CheckCircle, variant: 'secondary' as const },
      cancelled: { label: 'Отменено', icon: XCircle, variant: 'destructive' as const },
    },
    material: {
      none: { label: 'Без макета', icon: Upload, variant: 'outline' as const },
      pending: { label: 'На проверке', icon: Clock, variant: 'secondary' as const },
      approved: { label: 'Одобрен', icon: CheckCircle, variant: 'default' as const },
      rejected: { label: 'Отклонён', icon: XCircle, variant: 'destructive' as const },
    },
  };

  const config = configs[type][status as keyof typeof configs[typeof type]];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="gap-1 text-[10px]">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function EmptyState({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="mb-1 font-medium">{title}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
