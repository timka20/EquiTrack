import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Building2,
  FileImage,
  BarChart3,
  Search,
  Check,
  X,
  Eye,
  Ban,
  Shield,
  ChevronLeft,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/useAuthStore';
import { useAdminStore } from '@/store/useAdminStore';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const platformTypes = [
  { value: 'billboard', label: 'Билборд' },
  { value: 'digital_screen', label: 'Цифровой экран' },
  { value: 'wall', label: 'Стена/Брандмауэр' },
  { value: 'mall', label: 'ТЦ' },
  { value: 'transport', label: 'Транспорт' },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    stats,
    users,
    pendingPlatforms,
    pendingMaterials,
    pendingBookings,
    allPlatforms,
    isLoading,
    fetchStats,
    fetchUsers,
    fetchPendingPlatforms,
    fetchPendingMaterials,
    fetchPendingBookings,
    fetchAllPlatforms,
    approvePlatform,
    rejectPlatform,
    approveMaterial,
    rejectMaterial,
    approveBooking,
    rejectBooking,
    blockUser,
    unblockUser,
    changeUserRole,
    deletePlatform,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'platform' | 'material' | 'reject' | 'user' | 'addPlatform' | 'editPlatform' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('moderation');

  const [platformForm, setPlatformForm] = useState({
    name: '',
    type: 'billboard',
    address: '',
    city: 'Москва',
    pricePerDay: '',
    image: '',
    description: '',
    size: '',
    format: '',
    illumination: true,
    traffic: '',
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      navigate('/');
      return;
    }

    fetchStats();
    fetchUsers();
    fetchPendingPlatforms();
    fetchPendingMaterials();
    fetchPendingBookings();
    if (user.role === 'admin') {
      fetchAllPlatforms();
    }
  }, [user, navigate, fetchStats, fetchUsers, fetchPendingPlatforms, fetchPendingMaterials, fetchPendingBookings, fetchAllPlatforms]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApprovePlatform = async (id: string) => {
    const success = await approvePlatform(id);
    if (success) {
      toast({ title: 'Площадка одобрена', description: 'Площадка успешно добавлена в каталог' });
    }
    setDialogType(null);
  };

  const handleRejectPlatform = async (id: string) => {
    const success = await rejectPlatform(id);
    if (success) {
      toast({ title: 'Площадка отклонена', description: 'Площадка не будет добавлена в каталог' });
    }
    setDialogType(null);
    setRejectReason('');
  };

  const handleApproveMaterial = async (id: string) => {
    const success = await approveMaterial(id);
    if (success) {
      toast({ title: 'Макет одобрен', description: 'Материал прошёл модерацию' });
    }
    setDialogType(null);
  };

  const handleRejectMaterial = async (id: string) => {
    const success = await rejectMaterial(id, rejectReason);
    if (success) {
      toast({ title: 'Макет отклонён', description: 'Материал не прошёл модерацию' });
    }
    setDialogType(null);
    setRejectReason('');
  };

  const handleApproveBooking = async (id: string) => {
    const success = await approveBooking(id);
    if (success) {
      toast({ title: 'Бронирование подтверждено', description: 'Бронирование успешно подтверждено' });
    }
    setDialogType(null);
  };

  const handleRejectBooking = async (id: string) => {
    const success = await rejectBooking(id);
    if (success) {
      toast({ title: 'Бронирование отклонено', description: 'Бронирование отменено' });
    }
    setDialogType(null);
  };

  const handleBlockUser = async (userId: string, isBlocked: boolean) => {
    if (isBlocked) {
      const success = await unblockUser(userId);
      if (success) toast({ title: 'Пользователь разблокирован' });
    } else {
      const success = await blockUser(userId);
      if (success) toast({ title: 'Пользователь заблокирован' });
    }
  };

  const handleChangeRole = async (userId: string, role: any) => {
    const success = await changeUserRole(userId, role);
    if (success) {
      toast({ title: 'Роль изменена', description: `Новая роль: ${role}` });
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, role });
      }
    }
  };

  const handleAddPlatform = async () => {
    try {
      await api.createPlatform({
        ...platformForm,
        pricePerDay: parseInt(platformForm.pricePerDay),
        images: [platformForm.image],
        available: true,
      });
      toast({ title: 'Площадка добавлена', description: 'Новая площадка успешно создана' });
      setDialogType(null);
      setPlatformForm({
        name: '',
        type: 'billboard',
        address: '',
        city: 'Москва',
        pricePerDay: '',
        image: '',
        description: '',
        size: '',
        format: '',
        illumination: true,
        traffic: '',
      });
      fetchAllPlatforms();
      fetchStats();
    } catch (error: any) {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeletePlatform = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту площадку?')) return;
    const success = await deletePlatform(id);
    if (success) {
      toast({ title: 'Площадка удалена' });
    }
  };

  const openUserDetails = (u: any) => {
    setSelectedUser(u);
    setDialogType('user');
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      advertiser: '📢 Рекламодатель',
      owner: '🏢 Владелец',
      moderator: '🛡️ Модератор',
      admin: '⚙️ Админ',
    };
    return roles[role] || role;
  };

  const getTypeLabel = (type: string) => {
    return platformTypes.find(t => t.value === type)?.label || type;
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero px-4 pb-4 pt-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Панель управления</h1>
            <p className="text-sm text-muted-foreground">
              {user.role === 'admin' ? 'Администратор' : 'Модератор'}
            </p>
          </div>
        </div>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 px-4 py-4"
      >
        <StatCard icon={<Users className="h-5 w-5" />} label="Пользователи" value={(stats.usersCount ?? 0).toLocaleString()} />
        <StatCard icon={<Building2 className="h-5 w-5" />} label="Площадки" value={stats.platformsCount.toString()} />
        <StatCard icon={<FileImage className="h-5 w-5" />} label="На модерации" value={stats.pendingModerationCount.toString()} color="warning" />
        <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Бронирований" value={(stats.bookingsCount ?? 0).toLocaleString()} />
      </motion.div>

      {}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск пользователей, площадок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="moderation" className="flex-1">
            Модерация ({pendingPlatforms.length + pendingMaterials.length + pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="users" className="flex-1">
            Пользователи ({filteredUsers.length})
          </TabsTrigger>
          {user.role === 'admin' && (
            <TabsTrigger value="platforms" className="flex-1">
              Площадки ({allPlatforms.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="moderation" className="mt-4 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <>
              {}
              {pendingPlatforms.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Building2 className="h-4 w-4 text-primary" />
                    Площадки на проверке
                    <Badge variant="secondary">{pendingPlatforms.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {pendingPlatforms.map((platform) => (
                        <motion.div
                          key={platform.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-3 rounded-xl border border-border p-3"
                        >
                          <img
                            src={platform.image}
                            alt={platform.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{platform.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {platform.address}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {platform.ownerName} • {new Date(platform.submittedAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => { setSelectedItem(platform); setDialogType('platform'); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-success"
                              onClick={() => handleApprovePlatform(platform.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => { setSelectedItem(platform); setDialogType('reject'); }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {}
              {pendingMaterials.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <FileImage className="h-4 w-4 text-primary" />
                    Макеты на проверке
                    <Badge variant="secondary">{pendingMaterials.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {pendingMaterials.map((material) => (
                        <motion.div
                          key={material.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-3 rounded-xl border border-border p-3"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <FileImage className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{material.platformName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              <User className="h-3 w-3 inline mr-1" />
                              {material.advertiserName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(material.submittedAt).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => { setSelectedItem(material); setDialogType('material'); }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-success"
                              onClick={() => handleApproveMaterial(material.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => { setSelectedItem(material); setDialogType('reject'); }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {}
              {pendingBookings.length > 0 && (
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                    <Calendar className="h-4 w-4 text-primary" />
                    Бронирования на подтверждение
                    <Badge variant="secondary">{pendingBookings.length}</Badge>
                  </h3>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {pendingBookings.map((booking) => (
                        <motion.div
                          key={booking.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="flex items-center gap-3 rounded-xl border border-border p-3"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{booking.platformName}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              <User className="h-3 w-3 inline mr-1" />
                              {booking.userName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(booking.startDate).toLocaleDateString('ru-RU')} — {new Date(booking.endDate).toLocaleDateString('ru-RU')}
                              {' · '}
                              {booking.totalPrice?.toLocaleString('ru-RU')} ₽
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-success"
                              onClick={() => handleApproveBooking(booking.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleRejectBooking(booking.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </section>
              )}

              {pendingPlatforms.length === 0 && pendingMaterials.length === 0 && pendingBookings.length === 0 && (
                <EmptyState
                  icon={<CheckCircle className="h-8 w-8" />}
                  title="Всё проверено!"
                  description="Нет объектов на модерации"
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <div className="space-y-2">
            <AnimatePresence>
              {filteredUsers.map((u) => (
                <motion.button
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => openUserDetails(u)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      u.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{u.name}</p>
                      {(u as any).status === 'blocked' && (
                        <Badge variant="destructive" className="text-[10px] px-1 py-0">Заблокирован</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <Badge variant="secondary" className="text-xs">
                      {getRoleLabel(u.role)}
                    </Badge>
                    <ChevronLeft className="h-4 w-4 -rotate-180 text-muted-foreground" />
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {user.role === 'admin' && (
          <TabsContent value="platforms" className="mt-4">
            <div className="mb-4">
              <Button className="w-full" onClick={() => setDialogType('addPlatform')}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить площадку
              </Button>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {allPlatforms.map((platform) => (
                  <motion.div
                    key={platform.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <img
                      src={platform.image}
                      alt={platform.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{platform.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        <MapPin className="h-3 w-3 inline mr-1" />
                        {platform.city}, {platform.address}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={platform.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                          {platform.status === 'active' ? 'Активна' : platform.status === 'pending' ? 'На модерации' : 'Отклонена'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{(platform.pricePerDay ?? 0).toLocaleString()} ₽/сут</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => navigate(`/platform/${platform.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeletePlatform(platform.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {}
      <Dialog open={!!dialogType} onOpenChange={() => setDialogType(null)}>
        <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
          {dialogType === 'platform' && selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedItem.name}</DialogTitle>
                <DialogDescription>
                  {selectedItem.address}, {selectedItem.city}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-40 object-cover rounded-lg"
                />
                <p className="text-sm">{selectedItem.description}</p>
                <div className="text-sm space-y-1">
                  <p><strong>Тип:</strong> {getTypeLabel(selectedItem.type)}</p>
                  <p><strong>Размер:</strong> {selectedItem.size || selectedItem.specs?.size || 'Не указано'}</p>
                  <p><strong>Формат:</strong> {selectedItem.format || selectedItem.specs?.format || 'Не указано'}</p>
                  <p><strong>Освещение:</strong> {(selectedItem.illumination || selectedItem.specs?.illumination) ? 'Есть' : 'Нет'}</p>
                  <p><strong>Трафик:</strong> {selectedItem.traffic || selectedItem.specs?.traffic || 'Не указано'}</p>
                  <p><strong>Цена:</strong> {(selectedItem.pricePerDay ?? 0).toLocaleString()} ₽/сутки</p>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleRejectPlatform(selectedItem.id)}
                    className="text-destructive"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Отклонить
                  </Button>
                  <Button
                    onClick={() => handleApprovePlatform(selectedItem.id)}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Одобрить
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}

          {dialogType === 'reject' && selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle>Отклонить</DialogTitle>
                <DialogDescription>
                  Укажите причину отклонения
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Причина отклонения..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogType(null)}>
                    Отмена
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if ('platformId' in selectedItem) {
                        handleRejectMaterial(selectedItem.id);
                      } else {
                        handleRejectPlatform(selectedItem.id);
                      }
                    }}
                    disabled={!rejectReason.trim()}
                  >
                    Отклонить
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}

          {dialogType === 'user' && selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Профиль пользователя</DialogTitle>
                <DialogDescription>
                  ID: {selectedUser.id}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground overflow-hidden">
                    {selectedUser.avatar ? (
                      <img src={selectedUser.avatar} alt={selectedUser.name} className="h-full w-full object-cover" />
                    ) : (
                      selectedUser.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedUser.name}</p>
                    <Badge variant={selectedUser.status === 'blocked' ? 'destructive' : 'default'}>
                      {selectedUser.status === 'blocked' ? 'Заблокирован' : 'Активен'}
                    </Badge>
                  </div>
                </div>

                {}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">📞</span>
                      <span>{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.company && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">🏢</span>
                      <span>{selectedUser.company}</span>
                    </div>
                  )}
                </div>

                {}
                {user?.role === 'admin' && selectedUser.id !== user.id && (
                  <div className="space-y-2">
                    <Label>Роль пользователя</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(value) => handleChangeRole(selectedUser.id, value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advertiser">📢 Рекламодатель</SelectItem>
                        <SelectItem value="owner">🏢 Владелец</SelectItem>
                        <SelectItem value="moderator">🛡️ Модератор</SelectItem>
                        <SelectItem value="admin">⚙️ Админ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-lg font-bold">0</p>
                    <p className="text-xs text-muted-foreground">Бронирований</p>
                  </div>
                  <div className="rounded-lg bg-muted p-3 text-center">
                    <p className="text-lg font-bold">
                      {new Date().getFullYear() - 2020}
                    </p>
                    <p className="text-xs text-muted-foreground">Лет на платформе</p>
                  </div>
                </div>

                {}
                {user?.role === 'admin' && selectedUser.id !== user.id && (
                  <DialogFooter className="gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => handleBlockUser(selectedUser.id, selectedUser.status === 'blocked')}
                      className={selectedUser.status === 'blocked' ? 'text-success' : 'text-destructive'}
                    >
                      {selectedUser.status === 'blocked' ? (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Разблокировать
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-1" />
                          Заблокировать
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                )}
              </div>
            </>
          )}

          {dialogType === 'addPlatform' && (
            <>
              <DialogHeader>
                <DialogTitle>Добавить площадку</DialogTitle>
                <DialogDescription>
                  Создайте новую рекламную площадку
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Название</Label>
                  <Input
                    value={platformForm.name}
                    onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })}
                    placeholder="Например: Билборд на Тверской"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Тип</Label>
                  <Select
                    value={platformForm.type}
                    onValueChange={(value) => setPlatformForm({ ...platformForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platformTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Город</Label>
                  <Input
                    value={platformForm.city}
                    onChange={(e) => setPlatformForm({ ...platformForm, city: e.target.value })}
                    placeholder="Москва"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Адрес</Label>
                  <Input
                    value={platformForm.address}
                    onChange={(e) => setPlatformForm({ ...platformForm, address: e.target.value })}
                    placeholder="ул. Тверская, 15"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Цена за сутки (₽)</Label>
                  <Input
                    type="number"
                    value={platformForm.pricePerDay}
                    onChange={(e) => setPlatformForm({ ...platformForm, pricePerDay: e.target.value })}
                    placeholder="15000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL изображения</Label>
                  <Input
                    value={platformForm.image}
                    onChange={(e) => setPlatformForm({ ...platformForm, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Размер</Label>
                  <Input
                    value={platformForm.size}
                    onChange={(e) => setPlatformForm({ ...platformForm, size: e.target.value })}
                    placeholder="6x3 м"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Формат</Label>
                  <Input
                    value={platformForm.format}
                    onChange={(e) => setPlatformForm({ ...platformForm, format: e.target.value })}
                    placeholder="Статичный баннер"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Трафик</Label>
                  <Input
                    value={platformForm.traffic}
                    onChange={(e) => setPlatformForm({ ...platformForm, traffic: e.target.value })}
                    placeholder="~50,000 авто/день"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={platformForm.description}
                    onChange={(e) => setPlatformForm({ ...platformForm, description: e.target.value })}
                    placeholder="Описание площадки..."
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setDialogType(null)}>
                    Отмена
                  </Button>
                  <Button
                    onClick={handleAddPlatform}
                    disabled={!platformForm.name || !platformForm.address || !platformForm.pricePerDay}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ icon, label, value, color = 'primary' }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: 'primary' | 'warning';
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className={`mb-2 ${color === 'warning' ? 'text-warning' : 'text-primary'}`}>
        {icon}
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function EmptyState({ icon, title, description }: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="mb-1 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
