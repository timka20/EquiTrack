import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router';
import {
  User, Building2, Dumbbell, UserCheck, Stethoscope, Shield,
  Bell, TrendingUp, Calendar, FileText, Plus, CheckCircle,
  AlertCircle, Clock, Crown, Activity, BarChart3, Settings,
  MessageSquare, ChevronRight, Star, Trophy, MapPin, 
  Flag, Award, DollarSign, Users, ClipboardList, XCircle,
  Syringe, Ban, FolderCheck, CalendarDays, Heart, Medal, Search
} from 'lucide-react';
import { C } from '../data/colors';
import { useAuth } from '../contexts/AuthContext';
import { horsesApi, racesApi, trainingsApi, medicalApi, adminApi, notificationsApi, breedingsApi, jockeyReportsApi } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type Role = 'owner' | 'farm' | 'trainer' | 'jockey' | 'vet' | 'admin' | 'user' | 'guest';

const roles: { key: Role; label: string; icon: any; desc: string }[] = [
  { key: 'owner', label: 'Владелец', icon: User, desc: 'Частный владелец лошади' },
  { key: 'farm', label: 'Конный завод', icon: Building2, desc: 'Управление заводом' },
  { key: 'trainer', label: 'Тренер', icon: Dumbbell, desc: 'Тренировочный журнал' },
  { key: 'jockey', label: 'Жокей', icon: UserCheck, desc: 'Отчёты по заездам' },
  { key: 'vet', label: 'Ветеринар', icon: Stethoscope, desc: 'Медицинские карты' },
  { key: 'admin', label: 'Администратор', icon: Shield, desc: 'Управление платформой' },
  { key: 'user', label: 'Пользователь', icon: User, desc: 'Гостевой доступ' },
  { key: 'guest', label: 'Гость', icon: User, desc: 'Гостевой доступ' },
];

function formatMoney(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') return '—';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(num);
}

function getUserName(user: any): { firstName: string; lastName: string } {
  const firstName = user?.firstName || user?.first_name || '';
  const lastName = user?.lastName || user?.last_name || '';
  return { firstName, lastName };
}

function translateMedicalType(type: string): string {
  const map: Record<string, string> = {
    routine: 'Плановый осмотр',
    checkup: 'Осмотр',
    treatment: 'Лечение',
    injury: 'Травма',
    trauma: 'Травма',
    vaccination: 'Вакцинация',
    surgery: 'Операция',
    examination: 'Обследование',
    'Плановый осмотр': 'Плановый осмотр',
    'Лечение': 'Лечение',
    'Травма': 'Травма',
    'Вакцинация': 'Вакцинация',
  };
  return map[type?.trim()] || type || 'Запись';
}

function translateTrainingType(type: string): string {
  const map: Record<string, string> = {
    cardio: 'Кардио',
    gallop: 'Галоп',
    trot: 'Рысь',
    sprint: 'Спринт',
    dressage: 'Выездка',
    'regular training': 'Обычная тренировка',
    canter: 'Кантер',
    jumping: 'Прыжки',
    endurance: 'Выносливость',
    work: 'Работа',
    'Галоп': 'Галоп',
    'Рысь': 'Рысь',
    'Спринт': 'Спринт',
    'Выездка': 'Выездка',
  };
  return map[type?.toLowerCase()?.trim()] || type || 'Тренировка';
}

function translateTrainingNote(note: string): string {
  const map: Record<string, string> = {
    'Regular training': 'Обычная тренировка',
    'regular training': 'Обычная тренировка',
  };
  return map[note?.trim()] || note || '';
}

function translateMedicalDescription(desc: string): string {
  const map: Record<string, string> = {
    'Regular checkup': 'Регулярный осмотр',
    'General examination': 'Общий осмотр',
    'Annual vaccination': 'Ежегодная вакцинация',
    'Vaccination': 'Вакцинация',
    'Minor tendon strain': 'Небольшое растяжение сухожилия',
    'Routine check': 'Плановый осмотр',
  };
  return map[desc?.trim()] || desc || '';
}

function getPhoto(h: any): string {
  try {
    if (typeof h.photos === 'string') {
      const parsed = JSON.parse(h.photos);
      return parsed[0] || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
    }
    if (Array.isArray(h.photos)) return h.photos[0] || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
  } catch { }
  return 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
}

function UserDashboard() {
  const [horses, setHorses] = useState<any[]>([]);
  const [upcomingRaces, setUpcomingRaces] = useState<any[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [favoriteHorses, setFavoriteHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [horsesData, racesData, unreadCount] = await Promise.all([
          horsesApi.getAll(),
          racesApi.getAll(),
          notificationsApi.getUnreadCount().catch(() => 0)
        ]);
        setHorses(horsesData.slice(0, 5));
        setUpcomingRaces(racesData.filter((r: any) => r.status !== 'finished').slice(0, 3));
        setNotificationsCount(unreadCount?.count ?? unreadCount ?? 0);

        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
          const favIds = JSON.parse(savedFavorites);
          setFavoritesCount(favIds.length);

          const favHorses = horsesData.filter((h: any) => favIds.includes(h.id));
          setFavoriteHorses(favHorses);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [])

  if (loading) return <div style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Лошадей в каталоге', val: horses.length, icon: Crown, color: C.accentGold },
          { label: 'Предстоящих скачек', val: upcomingRaces.length, icon: Flag, color: C.accentAmber },
          { label: 'Ваших закладок', val: favoritesCount, icon: Heart, color: '#dc2626' },
          { label: 'Уведомлений', val: notificationsCount, icon: Bell, color: C.accentSienna },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <Icon size={24} style={{ color: s.color }} />
              </div>
              <p style={{ fontFamily: "'Unbounded', sans-serif", color: s.color, fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</p>
              <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Ближайшие скачки
          </h3>
          <div className="space-y-3">
            {upcomingRaces.map(r => (
              <div key={r.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.875rem 1rem', background: C.bgSecondary, borderRadius: '8px' }}>
                <Calendar size={18} style={{ color: C.accentGold, flexShrink: 0 }} />
                <div className="flex-1">
                  <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{r.hippodrome} · {r.distance}м</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '0.95rem', fontWeight: 700 }}>{formatMoney(r.prizeFund || r.prize_fund || 0)}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.72rem' }}>{new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Быстрые ссылки
          </h3>
          <div className="space-y-2">
            {[
              { label: 'Каталог лошадей', href: '/catalog', icon: Crown },
              { label: 'Скачки и события', href: '/races', icon: Flag },
              { label: 'Результаты заездов', href: '/results', icon: Trophy },
              { label: 'Разведение', href: '/breeding', icon: Heart },
            ].map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.label} to={link.href} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', background: C.bgSecondary, borderRadius: '8px', textDecoration: 'none' }}>
                  <Icon size={18} style={{ color: C.accentGold }} />
                  <span style={{ color: C.textPrimary, fontWeight: 600, fontSize: '0.9rem', flex: 1 }}>{link.label}</span>
                  <ChevronRight size={16} style={{ color: C.textMuted }} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {favoriteHorses.length > 0 && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Избранные лошади
          </h3>
          <div className="space-y-3">
            {favoriteHorses.slice(0, 5).map(h => (
              <Link key={h.id} to={`/horse/${h.id}`} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.875rem 1rem', background: C.bgSecondary, borderRadius: '8px', textDecoration: 'none' }}>
                <img src={getPhoto(h)} alt={h.name} style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                <div className="flex-1">
                  <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{h.name}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{h.birthYear} г.р. · {h.gender === 'stallion' ? 'Жеребец' : h.gender === 'mare' ? 'Кобыла' : 'Мерин'}</p>
                </div>
                <ChevronRight size={16} style={{ color: C.textMuted }} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OwnerDashboard({ userId }: { userId: number }) {
  const [myHorses, setMyHorses] = useState<any[]>([]);
  const [upcomingRaces, setUpcomingRaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [horsesData, racesData] = await Promise.all([
          horsesApi.getAll({ ownerId: userId }),
          racesApi.getAll()
        ]);
        setMyHorses(horsesData.slice(0, 5));
        setUpcomingRaces(racesData.filter((r: any) => r.status !== 'finished').slice(0, 3));
      } catch (error) {
        console.error('Error fetching owner data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const earningsData = [
    { month: 'Июл', earned: 0, spent: 120000 },
    { month: 'Авг', earned: 450000, spent: 130000 },
    { month: 'Сен', earned: 280000, spent: 115000 },
    { month: 'Окт', earned: 1125000, spent: 140000 },
    { month: 'Ноя', earned: 0, spent: 125000 },
    { month: 'Дек', earned: 0, spent: 130000 },
    { month: 'Янв', earned: 1250000, spent: 135000 },
  ];

  if (loading) return <div style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Моих лошадей', val: myHorses.length, icon: Crown, color: C.accentGold },
          { label: 'Стартов в сезоне', val: 12, icon: Flag, color: C.accentAmber },
          { label: 'Побед', val: myHorses.reduce((sum, h) => sum + (h.wins || 0), 0), icon: Trophy, color: '#16a34a' },
          { label: 'Выиграно', val: formatMoney(myHorses.reduce((sum, h) => sum + (h.totalEarnings || 0), 0)), icon: DollarSign, color: C.accentSienna },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <Icon size={24} style={{ color: s.color }} />
              </div>
              <p style={{ fontFamily: "'Unbounded', sans-serif", color: s.color, fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</p>
              <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }} className="lg:col-span-2">
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Доходы и расходы
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={earningsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v / 1000}K`} />
              <Tooltip formatter={(v: any, n) => [formatMoney(v), n === 'earned' ? 'Выигрыш' : 'Расходы']} />
              <Area type="monotone" dataKey="earned" stroke={C.accentGold} fill="rgba(201,169,98,0.15)" strokeWidth={2} name="earned" />
              <Area type="monotone" dataKey="spent" stroke={C.accentSienna} fill="rgba(166,123,91,0.1)" strokeWidth={2} name="spent" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Мои лошади
          </h3>
          <div className="space-y-3">
            {myHorses.map(h => (
              <Link to={`/horse/${h.id}`} key={h.id}
                style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', textDecoration: 'none', padding: '0.5rem', borderRadius: '8px', background: C.bgSecondary }}>
                <img src={getPhoto(h)} alt={h.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.name}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>{h.wins || 0} побед · {formatMoney(h.totalEarnings || 0)}</p>
                </div>
                <ChevronRight size={14} style={{ color: C.textMuted, flexShrink: 0 }} />
              </Link>
            ))}
            {myHorses.length === 0 && (
              <p style={{ color: C.textMuted, fontSize: '0.82rem', textAlign: 'center' }}>Нет лошадей</p>
            )}
          </div>
        </div>
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Ближайшие старты
        </h3>
        <div className="space-y-3">
          {upcomingRaces.map(r => (
            <div key={r.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.875rem 1rem', background: C.bgSecondary, borderRadius: '8px' }}>
              <Calendar size={18} style={{ color: C.accentGold, flexShrink: 0 }} />
              <div className="flex-1">
                <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</p>
                <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{r.hippodrome} · {r.distance}м</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '0.95rem', fontWeight: 700 }}>{formatMoney(r.prizeFund || r.prize_fund || 0)}</p>
                <p style={{ color: C.textMuted, fontSize: '0.72rem' }}>{new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrainerDashboard() {
  const [trainings, setTrainings] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [trainingData, setTrainingData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trainingsData, horsesData] = await Promise.all([
          trainingsApi.getAll(),
          horsesApi.getAll()
        ]);
        setTrainings(trainingsData.slice(0, 10));
        setHorses(horsesData);

        const weeklyData = calculateWeeklyTrainingData(trainingsData);
        setTrainingData(weeklyData);
      } catch (error) {
        console.error('Error fetching trainings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const calculateWeeklyTrainingData = (trainings: any[]) => {
    const weeks: Record<string, { week: string; gallop: number; trot: number; sprint: number }> = {};

    trainings.forEach((t: any) => {
      const date = new Date(t.training_date || t.date);
      const weekKey = `Нед ${getWeekNumber(date)}`;

      if (!weeks[weekKey]) {
        weeks[weekKey] = { week: weekKey, gallop: 0, trot: 0, sprint: 0 };
      }

      const type = (t.type || '').toLowerCase();
      if (type.includes('галоп')) weeks[weekKey].gallop++;
      else if (type.includes('рысь')) weeks[weekKey].trot++;
      else if (type.includes('спринт')) weeks[weekKey].sprint++;
      else weeks[weekKey].gallop++; 
    });

    return Object.values(weeks).slice(-4); 
  };

  const getWeekNumber = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  const handleAddTraining = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const duration = parseInt(formData.get('duration') as string);
    if (isNaN(duration) || duration < 1 || duration > 300) {
      alert('Длительность тренировки должна быть от 1 до 300 минут');
      return;
    }
    try {
      await trainingsApi.create({
        horseId: parseInt(formData.get('horseId') as string),
        type: formData.get('type') as string,
        duration,
        intensity: formData.get('intensity') as string,
        condition: formData.get('horseCondition') as string,
        notes: formData.get('notes') as string,
        date: new Date().toISOString()
      });
      setShowAddModal(false);

      const data = await trainingsApi.getAll();
      setTrainings(data.slice(0, 10));
    } catch (error: any) {
      alert('Ошибка при добавлении тренировки: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <div style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;

  const trainerHorses = horses.filter(h => h.trainer_id || h.status === 'in_training');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Подопечных лошадей', val: trainerHorses.length, icon: Crown },
          { label: 'Тренировок на неделе', val: trainings.length, icon: ClipboardList },
          { label: 'Всего тренировок', val: trainings.length, icon: FileText },
          { label: 'Побед подопечных', val: trainerHorses.reduce((sum, h) => sum + (h.wins || 0), 0), icon: Trophy },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <Icon size={24} style={{ color: C.accentGold }} />
              </div>
              <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '1.75rem', fontWeight: 700 }}>{s.val}</p>
              <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
              Журнал тренировок
            </h3>
            <button 
              onClick={() => setShowAddModal(true)}
              style={{ background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '6px', padding: '0.35rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              <Plus size={13} /> Запись
            </button>
          </div>
          <div className="space-y-3">
            {trainings.length > 0 ? trainings.map((log: any) => (
              <div key={log.id} style={{ padding: '0.875rem 1rem', background: C.bgSecondary, borderRadius: '8px' }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{log.horse_name || log.horseName || 'Лошадь'}</span>
                  <span style={{
                    background: log.horse_condition === 'excellent' || log.horseCondition === 'excellent' ? 'rgba(34,197,94,0.1)' : 'rgba(201,169,98,0.12)',
                    color: log.horse_condition === 'excellent' || log.horseCondition === 'excellent' ? '#16a34a' : C.accentGold,
                    fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.6rem', borderRadius: '100px',
                  }}>
                    {log.horse_condition === 'excellent' || log.horseCondition === 'excellent' ? 'Отлично' : 
                     log.horse_condition === 'good' || log.horseCondition === 'good' ? 'Хорошо' : 'Удовлетворительно'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ color: C.textSecondary, fontSize: '0.78rem' }}>{translateTrainingType(log.type)}</span>
                  <span style={{ color: C.textSecondary, fontSize: '0.78rem' }}>{log.duration} мин</span>
                  <span style={{ color: C.textMuted, fontSize: '0.78rem' }}>{new Date(log.training_date || log.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                </div>
                {log.notes && <p style={{ color: C.textMuted, fontSize: '0.78rem', marginTop: '0.35rem' }}>{translateTrainingNote(log.notes)}</p>}
              </div>
            )) : (
              <p style={{ color: C.textMuted, textAlign: 'center', padding: '1rem' }}>Нет записей о тренировках</p>
            )}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Нагрузка за месяц
          </h3>
          {trainingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trainingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="week" tick={{ fill: C.textMuted, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.textMuted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="gallop" name="Галоп" fill={C.accentGold} radius={[3, 3, 0, 0]} />
                <Bar dataKey="trot" name="Рысь" fill={C.accentAmber} radius={[3, 3, 0, 0]} />
                <Bar dataKey="sprint" name="Спринт" fill={C.accentSienna} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Нет данных для отображения</p>
          )}
        </div>
      </div>

      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Добавить тренировку
            </h3>
            <form onSubmit={handleAddTraining} className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Лошадь</label>
                <select name="horseId" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="">Выберите лошадь</option>
                  {trainerHorses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Тип тренировки</label>
                <select name="type" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="Галоп">Галоп</option>
                  <option value="Рысь">Рысь</option>
                  <option value="Спринт">Спринт</option>
                  <option value="Выездка">Выездка</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Длительность (мин)</label>
                  <input type="number" name="duration" required min="1" max="300" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Интенсивность</label>
                  <select name="intensity" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                    <option value="low">Низкая</option>
                    <option value="medium">Средняя</option>
                    <option value="high">Высокая</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Самочувствие лошади</label>
                <select name="horseCondition" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="excellent">Отлично</option>
                  <option value="good">Хорошо</option>
                  <option value="satisfactory">Удовлетворительно</option>
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Примечания</label>
                <textarea name="notes" rows={2} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                  Добавить
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: C.bgSecondary, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function VetDashboard() {
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedHorseId, setSelectedHorseId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vaccinesData, horsesData] = await Promise.all([
          medicalApi.getUpcomingVaccinations(),
          horsesApi.getAll()
        ]);
        setVaccinations(vaccinesData.slice(0, 10));
        setHorses(horsesData);

        const records: any[] = [];
        for (const horse of horsesData.slice(0, 5)) {
          try {
            const horseRecords = await medicalApi.getByHorseId(horse.id);
            records.push(...(horseRecords || []).map((r: any) => ({ ...r, horse_name: horse.name, horse_id: horse.id })));
          } catch (e) {

          }
        }
        setMedicalRecords(records.slice(0, 10));
      } catch (error) {
        console.error('Error fetching vet data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddVaccination = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const nextDate = formData.get('nextDate') as string;
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(date) < today) {
      alert('Дата прививки не может быть в прошлом');
      return;
    }
    if (nextDate && new Date(nextDate) <= new Date(date)) {
      alert('Следующая дата должна быть позже даты прививки');
      return;
    }
    try {
      await medicalApi.createVaccination(parseInt(selectedHorseId), {
        name: formData.get('name') as string,
        date,
        nextDate,
        notes: formData.get('notes') as string
      });
      setShowVaccineModal(false);

      const data = await medicalApi.getUpcomingVaccinations();
      setVaccinations(data.slice(0, 10));
    } catch (error: any) {
      alert('Ошибка при добавлении прививки: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const handleAddMedicalRecord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const date = formData.get('date') as string;
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(date) < today) {
      alert('Дата записи не может быть в прошлом');
      return;
    }
    try {
      await medicalApi.createRecord(parseInt(selectedHorseId), {
        date,
        type: formData.get('type') as string,
        description: formData.get('description') as string,
        diagnosis: formData.get('diagnosis') as string,
        treatment: formData.get('treatment') as string,
        restrictions: formData.get('restrictions') as string
      });
      setShowRecordModal(false);

      const horsesData = await horsesApi.getAll();
      const records: any[] = [];
      for (const horse of horsesData.slice(0, 5)) {
        try {
          const horseRecords = await medicalApi.getByHorseId(horse.id);
          records.push(...(horseRecords || []).map((r: any) => ({ ...r, horse_name: horse.name, horse_id: horse.id })));
        } catch (e) {}
      }
      setMedicalRecords(records.slice(0, 10));
    } catch (error: any) {
      alert('Ошибка при добавлении медицинской записи: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const overdueCount = vaccinations.filter((v: any) => {
    const nextDate = new Date(v.next_date || v.nextDate);
    return nextDate < new Date();
  }).length;

  const restrictionsCount = medicalRecords.filter((r: any) => r.restrictions && r.restrictions.trim() !== '').length;

  if (loading) return <div style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Лошадей на учёте', val: horses.length, icon: Crown, color: C.accentGold },
          { label: 'Запланировано прививок', val: vaccinations.length, icon: Syringe, color: C.accentAmber },
          { label: 'Просроченных прививок', val: overdueCount, icon: AlertCircle, color: '#dc2626' },
          { label: 'Активных ограничений', val: restrictionsCount, icon: Ban, color: C.accentSienna },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <Icon size={24} style={{ color: s.color }} />
              </div>
              <p style={{ fontFamily: "'Unbounded', sans-serif", color: s.color, fontSize: '1.75rem', fontWeight: 700 }}>{s.val}</p>
              <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
              График прививок
            </h3>
            <button 
              onClick={() => setShowVaccineModal(true)}
              style={{ background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '6px', padding: '0.35rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Добавить
            </button>
          </div>
          <div className="space-y-3">
            {vaccinations.length > 0 ? vaccinations.map((v: any, i: number) => {
              const nextDate = new Date(v.next_date || v.nextDate);
              const isOverdue = nextDate < new Date();
              const isUpcoming = !isOverdue && (nextDate.getTime() - new Date().getTime()) < 7 * 24 * 60 * 60 * 1000;
              return (
                <div key={i} style={{ padding: '0.875rem', background: C.bgSecondary, borderRadius: '8px', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
                  <div style={{
                    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                    background: isOverdue ? '#dc2626' : isUpcoming ? C.accentAmber : '#16a34a'
                  }} />
                  <div className="flex-1">
                    <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.875rem' }}>{v.horse_name || v.horseName || 'Лошадь'}</p>
                    <p style={{ color: C.textSecondary, fontSize: '0.78rem' }}>{v.name}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: isOverdue ? '#dc2626' : C.textSecondary, fontSize: '0.78rem', fontWeight: isOverdue ? 700 : 400 }}>
                      {isOverdue ? 'Просрочено!' : nextDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
              );
            }) : (
              <p style={{ color: C.textMuted, textAlign: 'center', padding: '1rem' }}>Нет запланированных прививок</p>
            )}
          </div>
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
              Медицинские записи
            </h3>
            <button 
              onClick={() => setShowRecordModal(true)}
              style={{ background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '6px', padding: '0.35rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Добавить
            </button>
          </div>
          <div className="space-y-3">
            {medicalRecords.length > 0 ? medicalRecords.map((r: any, i: number) => (
              <div key={i} style={{ padding: '0.875rem', background: C.bgSecondary, borderRadius: '8px' }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.875rem' }}>{r.horse_name || 'Лошадь'}</span>
                  <span style={{ color: C.textMuted, fontSize: '0.75rem' }}>{new Date(r.record_date || r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                </div>
                <p style={{ color: C.textSecondary, fontSize: '0.82rem', marginBottom: '0.35rem' }}>{translateMedicalType(r.type)}: {translateMedicalDescription(r.description)}</p>
                {r.restrictions && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={12} style={{ color: C.accentAmber }} />
                    <span style={{ color: C.accentAmber, fontSize: '0.75rem', fontWeight: 600 }}>{r.restrictions}</span>
                  </div>
                )}
              </div>
            )) : (
              <p style={{ color: C.textMuted, textAlign: 'center', padding: '1rem' }}>Нет медицинских записей</p>
            )}
          </div>
        </div>
      </div>

      {showVaccineModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Добавить прививку
            </h3>
            <form onSubmit={handleAddVaccination} className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Лошадь</label>
                <select name="horseId" required value={selectedHorseId} onChange={(e) => setSelectedHorseId(e.target.value)} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="">Выберите лошадь</option>
                  {horses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Название прививки</label>
                <input type="text" name="name" required placeholder="Например: Тетанус" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Дата прививки</label>
                  <input type="date" name="date" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Следующая дата</label>
                  <input type="date" name="nextDate" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Примечания</label>
                <textarea name="notes" rows={2} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                  Добавить
                </button>
                <button type="button" onClick={() => setShowVaccineModal(false)} style={{ flex: 1, background: C.bgSecondary, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRecordModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Добавить медицинскую запись
            </h3>
            <form onSubmit={handleAddMedicalRecord} className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Лошадь</label>
                <select name="horseId" required value={selectedHorseId} onChange={(e) => setSelectedHorseId(e.target.value)} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="">Выберите лошадь</option>
                  {horses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Тип записи</label>
                <select name="type" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="Плановый осмотр">Плановый осмотр</option>
                  <option value="Лечение">Лечение</option>
                  <option value="Травма">Травма</option>
                  <option value="Вакцинация">Вакцинация</option>
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Дата</label>
                <input type="date" name="date" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Описание</label>
                <textarea name="description" required rows={2} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, resize: 'none' }} />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Диагноз</label>
                <input type="text" name="diagnosis" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Лечение</label>
                <input type="text" name="treatment" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Ограничения</label>
                <input type="text" name="restrictions" placeholder="Например: Исключить прыжки 2 нед." style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>
                  Добавить
                </button>
                <button type="button" onClick={() => setShowRecordModal(false)} style={{ flex: 1, background: C.bgSecondary, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function JockeyDashboard() {
  const [submitted, setSubmitted] = useState(false);
  const [upcomingRaces, setUpcomingRaces] = useState<any[]>([]);
  const [finishedRaces, setFinishedRaces] = useState<any[]>([]);
  const [horses, setHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRace, setSelectedRace] = useState<any>(null);
  const [selectedHorse, setSelectedHorse] = useState<string>('');
  const [reportForm, setReportForm] = useState({
    startBehavior: '',
    distanceBehavior: '',
    finishBehavior: '',
    finishCondition: '',
    equipmentNotes: '',
    recommendations: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [racesData, horsesData] = await Promise.all([
          racesApi.getAll(),
          horsesApi.getAll()
        ]);

        const upcoming = racesData
          .filter((r: any) => r.status !== 'finished' && new Date(r.date) >= new Date())
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);
        const finished = racesData
          .filter((r: any) => r.status === 'finished' || new Date(r.date) < new Date())
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20);
        setUpcomingRaces(upcoming);
        setFinishedRaces(finished);
        setHorses(horsesData);
        if (finished.length > 0) {
          setSelectedRace(finished[0]);
        }
      } catch (error) {
        console.error('Error fetching jockey data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmitReport = async () => {
    if (!selectedHorse) {
      alert('Выберите лошадь');
      return;
    }
    if (!selectedRace) {
      alert('Выберите скачку');
      return;
    }
    try {
      await jockeyReportsApi.create({
        raceId: selectedRace.id,
        horseId: parseInt(selectedHorse),
        startBehavior: reportForm.startBehavior,
        distanceBehavior: reportForm.distanceBehavior,
        finishBehavior: reportForm.finishBehavior,
        condition: reportForm.finishCondition,
        equipmentNotes: reportForm.equipmentNotes,
        recommendations: reportForm.recommendations,
      });
      setSubmitted(true);
    } catch (error: any) {
      alert('Ошибка при отправке отчета: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const formatRaceDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  };

  if (loading) return <div style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;

  const nextRace = upcomingRaces[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Предстоящих заездов', val: upcomingRaces.length, icon: Flag, color: C.accentGold },
          { label: 'Доступных лошадей', val: horses.length, icon: Crown, color: '#16a34a' },
          { label: 'Скачек в календаре', val: upcomingRaces.length, icon: CalendarDays, color: C.accentAmber },
          { label: 'Ближайший заезд', val: nextRace ? formatRaceDate(nextRace.date) : '—', icon: CalendarDays, color: C.accentSienna },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <Icon size={24} style={{ color: s.color }} />
              </div>
              <p style={{ fontFamily: "'Unbounded', sans-serif", color: s.color, fontSize: '1.5rem', fontWeight: 700 }}>{s.val}</p>
              <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            {nextRace ? `Ближайший старт: ${nextRace.name}` : 'Нет предстоящих стартов'}
          </h3>
          {nextRace ? (
            <>
              <div style={{ background: C.bgSecondary, borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <p style={{ color: C.textMuted, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Дата</p>
                  <p style={{ color: C.accentGold, fontWeight: 700 }}>{formatRaceDate(nextRace.date)}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ color: C.textMuted, fontSize: '0.72rem' }}>Ипподром</p>
                  <p style={{ color: C.textPrimary, fontWeight: 600 }}>{nextRace.hippodrome}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                  <p style={{ color: C.textMuted, fontSize: '0.72rem' }}>Дистанция</p>
                  <p style={{ color: C.textPrimary, fontWeight: 600 }}>{nextRace.distance}м</p>
                </div>
              </div>

              <h4 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>
                Предстоящие скачки
              </h4>
              <div className="space-y-2.5" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {upcomingRaces.slice(1).map((race: any) => (
                  <div key={race.id} style={{ padding: '0.75rem', background: C.bgSecondary, borderRadius: '8px', cursor: 'pointer' }} onClick={() => setSelectedRace(race)}>
                    <div className="flex items-center justify-between">
                      <span style={{ color: C.textPrimary, fontWeight: 600, fontSize: '0.85rem' }}>{race.name}</span>
                      <span style={{ color: C.accentGold, fontSize: '0.75rem' }}>{formatRaceDate(race.date)}</span>
                    </div>
                    <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>{race.hippodrome} · {race.distance}м</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>В ближайшее время нет запланированных скачек</p>
          )}
        </div>

        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Отчёт после заезда
          </h3>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={48} style={{ color: '#16a34a', margin: '0 auto 1rem' }} />
              <p style={{ color: C.textPrimary, fontWeight: 700, marginBottom: '0.5rem' }}>Отчёт отправлен тренеру</p>
              <button onClick={() => { setSubmitted(false); setReportForm({ startBehavior: '', distanceBehavior: '', finishBehavior: '', finishCondition: '', equipmentNotes: '', recommendations: '' }); }} style={{ color: C.accentGold, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                Создать новый
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Скачка</label>
                <select 
                  value={selectedRace?.id || ''} 
                  onChange={(e) => setSelectedRace(finishedRaces.find(r => r.id === parseInt(e.target.value)) || null)}
                  disabled={finishedRaces.length === 0}
                  style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, opacity: finishedRaces.length === 0 ? 0.6 : 1 }}
                >
                  {finishedRaces.length === 0 && <option value="">Нет завершённых заездов</option>}
                  {finishedRaces.map(race => (
                    <option key={race.id} value={race.id}>{race.name} — {new Date(race.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Лошадь</label>
                <select 
                  value={selectedHorse} 
                  onChange={(e) => setSelectedHorse(e.target.value)}
                  style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}
                >
                  <option value="">Выберите лошадь</option>
                  {horses.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Поведение на старте</label>
                <textarea 
                  rows={2} 
                  value={reportForm.startBehavior}
                  onChange={(e) => setReportForm({...reportForm, startBehavior: e.target.value})}
                  placeholder="Описание поведения лошади..."
                  style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', resize: 'none', fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>На дистанции</label>
                <textarea 
                  rows={2} 
                  value={reportForm.distanceBehavior}
                  onChange={(e) => setReportForm({...reportForm, distanceBehavior: e.target.value})}
                  placeholder="Поведение на трассе..."
                  style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', resize: 'none', fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>На финише</label>
                <textarea 
                  rows={2} 
                  value={reportForm.finishBehavior}
                  onChange={(e) => setReportForm({...reportForm, finishBehavior: e.target.value})}
                  placeholder="Финишный рывок, усталость..."
                  style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', resize: 'none', fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Замечания по снаряжению</label>
                <textarea 
                  rows={2} 
                  value={reportForm.equipmentNotes}
                  onChange={(e) => setReportForm({...reportForm, equipmentNotes: e.target.value})}
                  placeholder="Что стоит изменить..."
                  style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', resize: 'none', fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, outline: 'none' }}
                />
              </div>
              <button
                onClick={handleSubmitReport}
                disabled={!selectedHorse}
                style={{ width: '100%', background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.9rem', fontWeight: 700, cursor: !selectedHorse ? 'not-allowed' : 'pointer', opacity: !selectedHorse ? 0.6 : 1 }}
              >
                Отправить тренеру
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'applications' | 'horses' | 'events' | 'breeding'>('overview');
  const [horses, setHorses] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [breedings, setBreedings] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, pendingApplications: 0, horses: 0, activeEvents: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserActive, setEditUserActive] = useState(true);
  const [editUserPassword, setEditUserPassword] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  const [editingRace, setEditingRace] = useState<any>(null);
  const [editRaceName, setEditRaceName] = useState('');
  const [editRaceHippodrome, setEditRaceHippodrome] = useState('');
  const [editRaceDistance, setEditRaceDistance] = useState('');
  const [editRacePrizeFund, setEditRacePrizeFund] = useState('');
  const [editRaceDate, setEditRaceDate] = useState('');
  const [editRaceStatus, setEditRaceStatus] = useState('');
  const [savingRace, setSavingRace] = useState(false);

  const [creatingRace, setCreatingRace] = useState(false);
  const [newRaceName, setNewRaceName] = useState('');
  const [newRaceHippodrome, setNewRaceHippodrome] = useState('');
  const [newRaceDistance, setNewRaceDistance] = useState('');
  const [newRacePrizeFund, setNewRacePrizeFund] = useState('');
  const [newRaceDate, setNewRaceDate] = useState('');
  const [newRaceStatus, setNewRaceStatus] = useState('scheduled');
  const [creatingRaceLoading, setCreatingRaceLoading] = useState(false);

  const roleLabels: Record<string, string> = {
    admin: 'Администратор',
    owner_private: 'Владелец',
    owner_stud: 'Конный завод',
    trainer: 'Тренер',
    jockey: 'Жокей',
    veterinarian: 'Ветеринар',
    user: 'Пользователь',
    guest: 'Гость',
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'applications') {
      fetchApplications();
    } else if (activeTab === 'horses') {
      fetchHorses();
    } else if (activeTab === 'events') {
      fetchRaces();
    } else if (activeTab === 'breeding') {
      fetchBreedings();
    } else if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, horsesData, racesData, usersData, applicationsData] = await Promise.all([
        adminApi.getStats().catch(() => ({ users: 0, pendingApplications: 0, horses: 0, activeEvents: 0 })),
        horsesApi.getAll(),
        racesApi.getAll(),
        adminApi.getAllUsers().catch(() => []),
        adminApi.getPendingApplications().catch(() => []),
      ]);

      setStats(statsData);
      setHorses(horsesData);
      setRaces(racesData.filter((r: any) => r.status !== 'finished'));
      setUsers(usersData);
      setApplications(applicationsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminApi.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchHorses = async () => {
    try {
      const horsesData = await horsesApi.getAll();
      setHorses(horsesData);
    } catch (err) {
      console.error('Error fetching horses:', err);
    }
  };

  const fetchRaces = async () => {
    try {
      const racesData = await racesApi.getAll();
      setRaces(racesData.filter((r: any) => r.status !== 'finished'));
    } catch (err) {
      console.error('Error fetching races:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await adminApi.getAllUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsData = await adminApi.getPendingApplications();
      setApplications(applicationsData);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const fetchBreedings = async () => {
    try {
      const breedingsData = await breedingsApi.getAll();
      setBreedings(breedingsData || []);
    } catch (err) {
      console.error('Error fetching breedings:', err);
    }
  };

  const handleApproveApplication = async (id: number | string) => {
    try {
      await adminApi.approveApplication(id);
      setApplications(applications.filter(a => a.id !== id));

      setStats(prev => ({ ...prev, pendingApplications: prev.pendingApplications - 1 }));
    } catch (err: any) {
      alert('Ошибка при одобрении заявки: ' + err.message);
    }
  };

  const handleRejectApplication = async (id: number | string) => {
    try {
      await adminApi.rejectApplication(id);
      setApplications(applications.filter(a => a.id !== id));

      setStats(prev => ({ ...prev, pendingApplications: prev.pendingApplications - 1 }));
    } catch (err: any) {
      alert('Ошибка при отклонении заявки: ' + err.message);
    }
  };

  const openEditUserModal = (user: any) => {
    setEditingUser(user);
    setEditUserRole(user.role);
    setEditUserActive(user.isActive !== false);
    setEditUserPassword('');
  };

  const closeEditUserModal = () => {
    setEditingUser(null);
    setEditUserRole('');
    setEditUserActive(true);
    setEditUserPassword('');
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setSavingUser(true);
    try {
      const updateData: any = {
        role: editUserRole,
        isActive: editUserActive,
      };
      await adminApi.updateUser(editingUser.id, updateData);

      if (editUserPassword.trim()) {
        await adminApi.updateUserPassword(editingUser.id, editUserPassword.trim());
      }

      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...updateData } : u));
      closeEditUserModal();
    } catch (err: any) {
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setSavingUser(false);
    }
  };

  const openEditRaceModal = (race: any) => {
    setEditingRace(race);
    setEditRaceName(race.name || '');
    setEditRaceHippodrome(race.hippodrome || '');
    setEditRaceDistance(String(race.distance || ''));
    setEditRacePrizeFund(String(race.prizeFund || ''));
    setEditRaceDate(race.date ? new Date(race.date).toISOString().split('T')[0] : '');
    setEditRaceStatus(race.status || 'upcoming');
  };

  const closeEditRaceModal = () => {
    setEditingRace(null);
    setEditRaceName('');
    setEditRaceHippodrome('');
    setEditRaceDistance('');
    setEditRacePrizeFund('');
    setEditRaceDate('');
    setEditRaceStatus('');
  };

  const handleSaveRace = async () => {
    if (!editingRace) return;
    setSavingRace(true);
    try {
      const updateData: any = {
        name: editRaceName,
        hippodrome: editRaceHippodrome,
        distance: parseInt(editRaceDistance) || 0,
        prizeFund: parseInt(editRacePrizeFund) || 0,
        date: editRaceDate ? new Date(editRaceDate).toISOString() : editingRace.date,
        status: editRaceStatus,
      };
      await racesApi.update(editingRace.id, updateData);

      setRaces(races.map(r => r.id === editingRace.id ? { ...r, ...updateData } : r));
      closeEditRaceModal();
    } catch (err: any) {
      alert('Ошибка при сохранении: ' + err.message);
    } finally {
      setSavingRace(false);
    }
  };

  const openCreateRaceModal = () => {
    setCreatingRace(true);
    setNewRaceName('');
    setNewRaceHippodrome('');
    setNewRaceDistance('');
    setNewRacePrizeFund('');
    setNewRaceDate('');
    setNewRaceStatus('scheduled');
  };

  const closeCreateRaceModal = () => {
    setCreatingRace(false);
    setNewRaceName('');
    setNewRaceHippodrome('');
    setNewRaceDistance('');
    setNewRacePrizeFund('');
    setNewRaceDate('');
    setNewRaceStatus('scheduled');
  };

  const handleCreateRace = async () => {
    setCreatingRaceLoading(true);
    try {
      const createData: any = {
        name: newRaceName,
        hippodrome: newRaceHippodrome,
        distance: parseInt(newRaceDistance) || 0,
        prizeFund: parseInt(newRacePrizeFund) || 0,
        date: newRaceDate ? new Date(newRaceDate).toISOString() : new Date().toISOString(),
        status: newRaceStatus,
      };
      const newRace = await racesApi.create(createData);

      setRaces([...races, newRace]);
      closeCreateRaceModal();
    } catch (err: any) {
      alert('Ошибка при создании: ' + err.message);
    } finally {
      setCreatingRaceLoading(false);
    }
  };

  const getUserDisplayName = (user: any) => {
    const firstName = user?.firstName || user?.first_name || '';
    const lastName = user?.lastName || user?.last_name || '';
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return user?.email || `Пользователь #${user?.id}`;
  };

  if (loading && activeTab !== 'overview') return <div style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;

  return (
    <div className="space-y-6">

      <div style={{ background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[
            { key: 'overview', label: 'Обзор', icon: BarChart3 },
            { key: 'users', label: 'Пользователи', icon: Users },
            { key: 'applications', label: 'Заявки', icon: ClipboardList },
            { key: 'horses', label: 'Все лошади', icon: Crown },
            { key: 'breeding', label: 'Разведение', icon: Heart },
            { key: 'events', label: 'События', icon: Flag },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  border: 'none', cursor: 'pointer',
                  background: activeTab === tab.key ? C.accentGold : 'transparent',
                  color: activeTab === tab.key ? C.textPrimary : C.textSecondary,
                  fontWeight: 600, fontSize: '0.875rem',
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', color: '#dc2626' }}>
          {error}
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Пользователей', val: stats.users || users.length, icon: Users, color: C.accentGold },
              { label: 'Ожидают заявок', val: stats.pendingApplications || applications.length, icon: ClipboardList, color: C.accentAmber },
              { label: 'Лошадей в базе', val: stats.horses || horses.length, icon: Crown, color: '#16a34a' },
              { label: 'Активных событий', val: stats.activeEvents || races.length, icon: Flag, color: C.accentSienna },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <Icon size={24} style={{ color: s.color }} />
                  </div>
                  <p style={{ fontFamily: "'Unbounded', sans-serif", color: s.color, fontSize: '1.75rem', fontWeight: 700 }}>{s.val}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Ожидающие заявки ({applications.length})
              </h3>
              <div className="space-y-2.5">
                {applications.slice(0, 5).map(app => (
                  <div key={app.id} style={{ padding: '0.75rem', background: C.bgSecondary, borderRadius: '8px' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.85rem' }}>
                          {app.horse?.name || app.horseName || 'Лошадь'}
                        </p>
                        <p style={{ color: C.textSecondary, fontSize: '0.75rem' }}>
                          {app.race?.name || app.raceName || 'Скачки'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('applications')}
                        style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Перейти
                      </button>
                    </div>
                  </div>
                ))}
                {applications.length === 0 && (
                  <p style={{ color: C.textMuted, fontSize: '0.82rem', textAlign: 'center' }}>Нет ожидающих заявок</p>
                )}
              </div>
            </div>

            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
              <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                Быстрые действия
              </h3>
              <div className="space-y-2">
                {[
                  { label: 'Управление пользователями', action: () => setActiveTab('users') },
                  { label: 'Проверить заявки', action: () => setActiveTab('applications') },
                  { label: 'Все лошади', action: () => setActiveTab('horses') },
                  { label: 'Активные события', action: () => setActiveTab('events') },
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    style={{
                      width: '100%', textAlign: 'left', padding: '0.875rem 1rem',
                      background: C.bgSecondary, border: 'none', borderRadius: '8px',
                      color: C.textPrimary, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Все пользователи ({users.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Имя', 'Email', 'Роль', 'Статус', ''].map(col => (
                    <th key={col} style={{ color: C.textMuted, textAlign: 'left', padding: '0.75rem', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{getUserDisplayName(u)}</td>
                    <td style={{ padding: '0.75rem', color: C.textSecondary }}>{u.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: C.bgSecondary, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                        {roleLabels[u.role] || u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: u.isActive !== false ? '#16a34a' : C.textMuted, fontWeight: 600 }}>
                        {u.isActive !== false ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <button 
                        onClick={() => openEditUserModal(u)}
                        style={{ color: C.accentGold, fontSize: '0.8rem', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Редактировать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Редактировать пользователя
            </h3>
            <div className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Роль
                </label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                >
                  <option value="guest">Гость</option>
                  <option value="user">Пользователь</option>
                  <option value="owner_private">Владелец</option>
                  <option value="owner_stud">Конный завод</option>
                  <option value="trainer">Тренер</option>
                  <option value="jockey">Жокей</option>
                  <option value="veterinarian">Ветеринар</option>
                  <option value="admin">Администратор</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editUserActive}
                    onChange={(e) => setEditUserActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: C.accentGold }}
                  />
                  <span style={{ color: C.textSecondary, fontSize: '0.82rem' }}>Активный пользователь</span>
                </label>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Новый пароль (оставьте пустым, чтобы не менять)
                </label>
                <input
                  type="password"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Новый пароль"
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleSaveUser}
                  disabled={savingUser}
                  style={{
                    flex: 1, background: C.accentGold, color: C.textPrimary,
                    border: 'none', borderRadius: '8px', padding: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 700, cursor: savingUser ? 'not-allowed' : 'pointer',
                    opacity: savingUser ? 0.7 : 1
                  }}
                >
                  {savingUser ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={closeEditUserModal}
                  disabled={savingUser}
                  style={{
                    flex: 1, background: C.bgSecondary, color: C.textSecondary,
                    border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 600, cursor: savingUser ? 'not-allowed' : 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Заявки на участие в скачках ({applications.length})
          </h3>
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} style={{ padding: '1rem', background: C.bgSecondary, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div>
                    <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '1rem' }}>
                      {app.horse_name || app.horseName || 'Лошадь'}
                    </p>
                    <p style={{ color: C.textSecondary, fontSize: '0.82rem' }}>
                      {app.race_name || app.raceName || 'Скачки'}
                    </p>
                    <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>
                      Владелец: {app.owner_first_name && app.owner_last_name ? `${app.owner_first_name} ${app.owner_last_name}` : (app.ownerName || '—')}
                    </p>
                    {app.created_at && (
                      <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>
                        Дата заявки: {new Date(app.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                  <span style={{ background: C.accentAmber + '20', color: C.accentAmber, padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700 }}>
                    На рассмотрении
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    onClick={() => handleApproveApplication(app.id)}
                    style={{ flex: 1, background: '#16a34a', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.6rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <CheckCircle size={16} /> Одобрить
                  </button>
                  <button 
                    onClick={() => handleRejectApplication(app.id)}
                    style={{ flex: 1, background: '#dc2626', color: '#FFF', border: 'none', borderRadius: '6px', padding: '0.6rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}
                  >
                    <XCircle size={16} /> Отклонить
                  </button>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <p style={{ color: C.textMuted, fontSize: '0.82rem', textAlign: 'center', padding: '2rem' }}>
                Нет ожидающих заявок
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'horses' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Все лошади в базе ({horses.length})
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                  {['Лошадь', 'Пол', 'Год', 'Статус', 'Владелец', ''].map(col => (
                    <th key={col} style={{ color: C.textMuted, textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horses.slice(0, 50).map((h, idx) => {
                  const statusMap: Record<string, string> = { for_sale: '#16a34a', reserved: C.accentAmber, in_training: C.accentGold, resting: C.textMuted, breeding: C.accentSienna, sold: '#dc2626', retired: C.textMuted };
                  const badge = statusMap[(h.status as string)] || C.textMuted;

                  const birthYear = h.birthYear || h.birth_year;
                  const ownerName = h.ownerName || (h.owner_first_name && h.owner_last_name ? `${h.owner_first_name} ${h.owner_last_name}` : null) || h.owner?.name || '—';
                  return (
                    <tr key={h.id} style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? 'transparent' : C.bgPrimary + '55' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700 }}>{h.name}</td>
                      <td style={{ padding: '0.75rem', color: C.textSecondary }}>
                        {h.gender === 'stallion' ? 'Жеребец' : h.gender === 'mare' ? 'Кобыла' : 'Мерин'}
                      </td>
                      <td style={{ padding: '0.75rem', color: C.textSecondary }}>{birthYear || '—'}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span style={{ color: badge, fontSize: '0.8rem', fontWeight: 600 }}>
                          {(['for_sale', 'reserved', 'in_training', 'resting', 'breeding', 'sold', 'retired'] as const).includes(h.status as any) ? { for_sale: 'На продаже', reserved: 'Забронирован', in_training: 'В тренинге', resting: 'Отдых', breeding: 'Разведение', sold: 'Продан', retired: 'Выбыл' }[(h.status as string)] : h.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', color: C.textSecondary }}>{ownerName}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <Link to={`/horse/${h.id}`} style={{ color: C.accentGold, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                          Карточка
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'breeding' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Управление разведением ({breedings.length})
          </h3>
          <div className="space-y-3">
            {breedings.map(breeding => (
              <div key={breeding.id} style={{ padding: '1rem', background: C.bgSecondary, borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                  <div>
                    <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '1rem' }}>
                      {breeding.mare_name || 'Кобыла'} × {breeding.stallion_name || 'Жеребец'}
                    </p>
                    <p style={{ color: C.textSecondary, fontSize: '0.82rem' }}>
                      Дата вязки: {breeding.planned_date ? new Date(breeding.planned_date).toLocaleDateString('ru-RU') : '—'}
                    </p>
                    {breeding.expected_foaling_date && (
                      <p style={{ color: C.textMuted, fontSize: '0.75rem' }}>
                        Ожидается рождение: {new Date(breeding.expected_foaling_date).toLocaleDateString('ru-RU')}
                      </p>
                    )}
                  </div>
                  <span style={{
                    background: breeding.status === 'pregnancy_confirmed' ? 'rgba(34,197,94,0.1)' : breeding.status === 'planned' ? 'rgba(212,165,116,0.2)' : 'rgba(100,100,100,0.1)',
                    color: breeding.status === 'pregnancy_confirmed' ? '#16a34a' : breeding.status === 'planned' ? C.accentAmber : '#666',
                    padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, whiteSpace: 'nowrap'
                  }}>
                    {breeding.status === 'pregnancy_confirmed' ? 'Жерёбость подтверждена' : breeding.status === 'planned' ? 'Запланировано' : 'Проведено'}
                  </span>
                </div>
                {breeding.notes && (
                  <p style={{ color: C.textMuted, fontSize: '0.75rem', paddingTop: '0.5rem', borderTop: `1px solid ${C.border}` }}>
                    Примечания: {breeding.notes}
                  </p>
                )}
              </div>
            ))}
            {breedings.length === 0 && (
              <p style={{ color: C.textMuted, fontSize: '0.82rem', textAlign: 'center', padding: '2rem' }}>
                Нет записей о разведении
              </p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
              Активные события ({races.length})
            </h3>
            <button
              onClick={openCreateRaceModal}
              style={{
                background: C.accentGold, color: C.textPrimary, border: 'none',
                borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem',
                fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem'
              }}
            >
              <Plus size={16} /> Создать событие
            </button>
          </div>
          <div className="space-y-3">
            {races.map(r => (
              <div key={r.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.875rem 1rem', background: C.bgSecondary, borderRadius: '8px' }}>
                <Calendar size={18} style={{ color: C.accentGold, flexShrink: 0 }} />
                <div className="flex-1">
                  <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{r.name}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{r.hippodrome} · {r.distance}м</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontSize: '0.95rem', fontWeight: 700 }}>{formatMoney(r.prizeFund || r.prize_fund)}</p>
                  <p style={{ color: C.textMuted, fontSize: '0.72rem' }}>{new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>
                </div>
                <button
                  onClick={() => openEditRaceModal(r)}
                  style={{ background: 'none', border: 'none', color: C.accentGold, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Редактировать
                </button>
              </div>
            ))}
            {races.length === 0 && (
              <p style={{ color: C.textMuted, fontSize: '0.82rem', textAlign: 'center', padding: '2rem' }}>
                Нет активных событий
              </p>
            )}
          </div>
        </div>
      )}

      {editingRace && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Редактировать событие
            </h3>
            <div className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Название
                </label>
                <input
                  type="text"
                  value={editRaceName}
                  onChange={(e) => setEditRaceName(e.target.value)}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Ипподром
                </label>
                <input
                  type="text"
                  value={editRaceHippodrome}
                  onChange={(e) => setEditRaceHippodrome(e.target.value)}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Дистанция (м)
                  </label>
                  <input
                    type="number"
                    value={editRaceDistance}
                    onChange={(e) => setEditRaceDistance(e.target.value)}
                    style={{
                      width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                      borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Призовой фонд (₽)
                  </label>
                  <input
                    type="number"
                    value={editRacePrizeFund}
                    onChange={(e) => setEditRacePrizeFund(e.target.value)}
                    style={{
                      width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                      borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Дата
                </label>
                <input
                  type="date"
                  value={editRaceDate}
                  onChange={(e) => setEditRaceDate(e.target.value)}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Статус
                </label>
                <select
                  value={editRaceStatus}
                  onChange={(e) => setEditRaceStatus(e.target.value)}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                >
                  <option value="upcoming">Предстоящие</option>
                  <option value="ongoing">Идут</option>
                  <option value="finished">Завершены</option>
                  <option value="cancelled">Отменены</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleSaveRace}
                  disabled={savingRace}
                  style={{
                    flex: 1, background: C.accentGold, color: C.textPrimary,
                    border: 'none', borderRadius: '8px', padding: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 700, cursor: savingRace ? 'not-allowed' : 'pointer',
                    opacity: savingRace ? 0.7 : 1
                  }}
                >
                  {savingRace ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                  onClick={closeEditRaceModal}
                  disabled={savingRace}
                  style={{
                    flex: 1, background: C.bgSecondary, color: C.textSecondary,
                    border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 600, cursor: savingRace ? 'not-allowed' : 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {creatingRace && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Создать новое событие
            </h3>
            <div className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Название
                </label>
                <input
                  type="text"
                  value={newRaceName}
                  onChange={(e) => setNewRaceName(e.target.value)}
                  placeholder="Например: Кубок Весны"
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Ипподром
                </label>
                <input
                  type="text"
                  value={newRaceHippodrome}
                  onChange={(e) => setNewRaceHippodrome(e.target.value)}
                  placeholder="Например: Московский ипподром"
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Дистанция (м)
                  </label>
                  <input
                    type="number"
                    value={newRaceDistance}
                    onChange={(e) => setNewRaceDistance(e.target.value)}
                    placeholder="1600"
                    style={{
                      width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                      borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                    }}
                  />
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Призовой фонд (₽)
                  </label>
                  <input
                    type="number"
                    value={newRacePrizeFund}
                    onChange={(e) => setNewRacePrizeFund(e.target.value)}
                    placeholder="1000000"
                    style={{
                      width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                      borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Дата и время
                </label>
                <input
                  type="datetime-local"
                  value={newRaceDate}
                  onChange={(e) => setNewRaceDate(e.target.value)}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                  Статус
                </label>
                <select
                  value={newRaceStatus}
                  onChange={(e) => setNewRaceStatus(e.target.value)}
                  style={{
                    width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`,
                    borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary, outline: 'none'
                  }}
                >
                  <option value="scheduled">Запланировано</option>
                  <option value="registration_open">Регистрация открыта</option>
                  <option value="registration_closed">Регистрация закрыта</option>
                  <option value="in_progress">Идёт</option>
                  <option value="finished">Завершено</option>
                  <option value="cancelled">Отменено</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  onClick={handleCreateRace}
                  disabled={creatingRaceLoading || !newRaceName || !newRaceHippodrome}
                  style={{
                    flex: 1, background: C.accentGold, color: C.textPrimary,
                    border: 'none', borderRadius: '8px', padding: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 700, cursor: (creatingRaceLoading || !newRaceName || !newRaceHippodrome) ? 'not-allowed' : 'pointer',
                    opacity: (creatingRaceLoading || !newRaceName || !newRaceHippodrome) ? 0.7 : 1
                  }}
                >
                  {creatingRaceLoading ? 'Создание...' : 'Создать'}
                </button>
                <button
                  onClick={closeCreateRaceModal}
                  disabled={creatingRaceLoading}
                  style={{
                    flex: 1, background: C.bgSecondary, color: C.textSecondary,
                    border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem',
                    fontSize: '0.875rem', fontWeight: 600, cursor: creatingRaceLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FarmDashboard() {
  const { user } = useAuth();
  const [horses, setHorses] = useState<any[]>([]);
  const [allHorses, setAllHorses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [myHorses, all] = await Promise.all([
          horsesApi.getAll({ ownerId: user?.id }),
          horsesApi.getAll()
        ]);
        setHorses(myHorses);
        setAllHorses(all);
      } catch (error) {
        console.error('Error fetching horses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const handleAddHorse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const birthYear = parseInt(formData.get('birthYear') as string);
    const currentYear = new Date().getFullYear();
    if (birthYear > currentYear) {
      alert('Год рождения не может быть в будущем');
      return;
    }
    try {
      await horsesApi.create({
        name: formData.get('name') as string,
        gender: formData.get('gender') as string,
        color: formData.get('color') as string,
        birthYear,
        birthCountry: formData.get('birthCountry') as string || 'Россия',
        fatherId: formData.get('fatherId') ? parseInt(formData.get('fatherId') as string) : undefined,
        motherId: formData.get('motherId') ? parseInt(formData.get('motherId') as string) : undefined,
        status: formData.get('status') as string || 'in_training',
        photos: ['https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800'],
      });
      setShowAddModal(false);
      const data = await horsesApi.getAll({ ownerId: user?.id });
      setHorses(data);
    } catch (error: any) {
      alert('Ошибка при добавлении лошади: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  if (loading) return <div style={{ color: C.textMuted, textAlign: 'center', padding: '2rem' }}>Загрузка...</div>;

  const stallions = allHorses.filter((h: any) => h.gender === 'stallion');
  const mares = allHorses.filter((h: any) => h.gender === 'mare');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Всего лошадей', val: horses.length, icon: Crown, color: C.accentGold },
          { label: 'На продаже', val: horses.filter(h => h.status === 'for_sale').length, icon: DollarSign, color: '#16a34a' },
          { label: 'В разведении', val: horses.filter(h => h.status === 'breeding').length, icon: Heart, color: C.accentAmber },
          { label: 'В тренинге', val: horses.filter(h => h.status === 'in_training').length, icon: Dumbbell, color: C.accentSienna },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <Icon size={24} style={{ color: s.color }} />
              </div>
              <p style={{ fontFamily: "'Unbounded', sans-serif", color: s.color, fontSize: '1.75rem', fontWeight: 700 }}>{s.val}</p>
              <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.95rem', fontWeight: 700 }}>
            Список лошадей завода
          </h3>
          <button onClick={() => setShowAddModal(true)} style={{ background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '6px', padding: '0.4rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Plus size={14} /> Добавить
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.border}` }}>
                {['Лошадь', 'Пол', 'Год', 'Статус', 'Побед', 'Выигрыш', ''].map(col => (
                  <th key={col} style={{ color: C.textMuted, textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {horses.map((h, idx) => {
                const statusMap: Record<string, string> = { for_sale: '#16a34a', reserved: C.accentAmber, in_training: C.accentGold, resting: C.textMuted, breeding: C.accentSienna, sold: '#dc2626', retired: C.textMuted };
                const badge = statusMap[(h.status as string)] || C.textMuted;
                return (
                  <tr key={h.id} style={{ borderBottom: `1px solid ${C.border}`, background: idx % 2 === 0 ? 'transparent' : C.bgPrimary + '55' }}>
                    <td style={{ padding: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={getPhoto(h)} alt={h.name} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                        <Link to={`/horse/${h.id}`} style={{ color: C.textPrimary, fontWeight: 700, textDecoration: 'none' }} className="hover:opacity-70">{h.name}</Link>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', color: C.textSecondary }}>
                      {h.gender === 'stallion' ? 'Жеребец' : h.gender === 'mare' ? 'Кобыла' : 'Мерин'}
                    </td>
                    <td style={{ padding: '0.75rem', color: C.textSecondary }}>{h.birthYear || h.birth_year}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ color: badge, fontSize: '0.8rem', fontWeight: 600 }}>
                        {(['for_sale', 'reserved', 'in_training', 'resting', 'breeding', 'sold', 'retired'] as const).includes(h.status as any) ? { for_sale: 'На продаже', reserved: 'Забронирован', in_training: 'В тренинге', resting: 'Отдых', breeding: 'Разведение', sold: 'Продан', retired: 'Выбыл' }[(h.status as string)] : h.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: C.textPrimary }}>{h.wins || 0}</td>
                    <td style={{ padding: '0.75rem', color: C.accentGold, fontWeight: 600, fontSize: '0.82rem' }}>
                      {h.totalEarnings > 0 ? new Intl.NumberFormat('ru-RU').format(h.totalEarnings) + ' ₽' : '—'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <Link to={`/horse/${h.id}`} style={{ color: C.accentGold, fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
                        Карточка
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: C.white, borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Добавить лошадь
            </h3>
            <form onSubmit={handleAddHorse} className="space-y-4">
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Кличка</label>
                <input name="name" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Пол</label>
                  <select name="gender" required style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                    <option value="stallion">Жеребец</option>
                    <option value="mare">Кобыла</option>
                    <option value="gelding">Мерин</option>
                  </select>
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Год рождения</label>
                  <input name="birthYear" type="number" required min="1900" max={new Date().getFullYear()} style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Масть</label>
                  <input name="color" required placeholder="Например: Вороной" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
                <div>
                  <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Страна рождения</label>
                  <input name="birthCountry" defaultValue="Россия" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }} />
                </div>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Отец</label>
                <select name="fatherId" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="">Не указан</option>
                  {stallions.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Мать</label>
                <select name="motherId" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="">Не указана</option>
                  {mares.map((h: any) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ color: C.textSecondary, fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>Статус</label>
                <select name="status" style={{ width: '100%', background: C.bgSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', color: C.textPrimary }}>
                  <option value="in_training">В тренинге</option>
                  <option value="for_sale">На продаже</option>
                  <option value="breeding">В разведении</option>
                  <option value="resting">На отдыхе</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, background: C.accentGold, color: C.textPrimary, border: 'none', borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}>Добавить</button>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, background: C.bgSecondary, color: C.textSecondary, border: `1px solid ${C.border}`, borderRadius: '8px', padding: '0.75rem', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  const roleMapping: Record<string, Role> = {
    'guest': 'guest',
    'user': 'user',
    'owner_private': 'owner',
    'owner_stud': 'farm',
    'trainer': 'trainer',
    'jockey': 'jockey',
    'veterinarian': 'vet',
    'admin': 'admin',
  };

  const userRole = (user?.role ? roleMapping[user.role] : 'guest') || 'guest';
  const isRegularUser = userRole === 'user' || userRole === 'guest';
  const isOwner = userRole === 'owner' || userRole === 'farm';

  const { firstName, lastName } = getUserName(user);
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : (user?.email || 'Пользователь');

  const roleComponents: Record<Role, React.ReactNode> = {
    owner: <OwnerDashboard userId={user?.id || 0} />,
    farm: <FarmDashboard />,
    trainer: <TrainerDashboard />,
    jockey: <JockeyDashboard />,
    vet: <VetDashboard />,
    admin: <AdminDashboard />,
    user: <UserDashboard />,
    guest: <UserDashboard />,
  };

  const currentRole = roles.find(r => r.key === userRole) || roles[0];

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", minHeight: '100vh' }}>

      <div style={{ background: C.textPrimary, padding: '3rem 0 2.5rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Личный кабинет
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700 }}>
              {user ? `Добро пожаловать, ${displayName}` : 'Загрузка...'}
            </h1>
            <div style={{ position: 'relative' }}>
              <button style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', color: '#FFF', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Bell size={15} />
                <span>0 уведомлений</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {user && userRole !== 'guest' && (
          <div style={{ background: `linear-gradient(135deg, ${C.textPrimary} 0%, #4A3C2E 100%)`, borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(201,169,98,0.2)', borderRadius: '10px', padding: '0.75rem' }}>
              {(() => { const Icon = currentRole.icon; return <Icon size={22} style={{ color: C.accentGold }} />; })()}
            </div>
            <div>
              <p style={{ color: '#FFF', fontFamily: "'Unbounded', sans-serif", fontSize: '0.95rem', fontWeight: 700 }}>
                Роль: {currentRole.label}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>{currentRole.desc}</p>
            </div>
          </div>
        )}

        {roleComponents[userRole as Role]}
      </div>
    </div>
  );
}
