import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Trophy, ChevronDown, Users, Check, Crown, X } from 'lucide-react';
import { C } from '../data/colors';
import { racesApi, horsesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}

const hippodromes = ['Все', 'Центральный Московский Ипподром', 'Пятигорский ипподром', 'Краснодарский ипподром', 'Ростовский ипподром'];

const statusLabels: Record<string, string> = { 
  scheduled: 'Запланирован',
  registration_open: 'Приём заявок', 
  registration_closed: 'Регистрация закрыта',
  finished: 'Завершён',
  cancelled: 'Отменён',
  in_progress: 'В процессе'
};

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  registration_open: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', dot: '#22c55e' },
  scheduled: { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', dot: '#f59e0b' },
  registration_closed: { bg: 'rgba(239,68,68,0.1)', text: '#dc2626', dot: '#ef4444' },
  finished: { bg: 'rgba(168,155,140,0.15)', text: C.textMuted, dot: C.textMuted },
  cancelled: { bg: 'rgba(100,100,100,0.1)', text: '#666', dot: '#666' },
  in_progress: { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', dot: '#3b82f6' },
};

const categoryColors: Record<string, string> = {
  'Группа I': C.accentGold,
  'Группа II': '#D4A574',
  'Группа III': '#A67B5B',
};

interface Race {
  id: number;
  name: string;
  date: string;
  hippodrome: string;
  distance: number;
  surface: string;
  prizeFund: number;
  category: string;
  status: string;
  description?: string;
}

export default function Races() {
  const { user } = useAuth();
  const [races, setRaces] = useState<Race[]>([]);
  const [filteredRaces, setFilteredRaces] = useState<Race[]>([]);
  const [selectedHippodrome, setSelectedHippodrome] = useState('Все');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<number | null>(null);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [raceDetails, setRaceDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerRaceId, setRegisterRaceId] = useState<number | null>(null);
  const [myHorses, setMyHorses] = useState<any[]>([]);
  const [selectedHorseId, setSelectedHorseId] = useState<string>('');
  const [loadingHorses, setLoadingHorses] = useState(false);

  const canRegister = user?.role === 'owner_private' || user?.role === 'owner_stud' || user?.role === 'admin' || user?.role === 'trainer';

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoading(true);
        const data = await racesApi.getAll();
        setRaces(data);
        setFilteredRaces(data);
      } catch (error) {
        console.error('Error fetching races:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRaces();
  }, []);

  useEffect(() => {
    let filtered = races;

    if (selectedHippodrome !== 'Все') {
      filtered = filtered.filter(r => r.hippodrome === selectedHippodrome);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    setFilteredRaces(filtered);
  }, [selectedHippodrome, selectedStatus, races]);

  const openRegisterModal = async (raceId: number) => {
    if (!canRegister) {
      alert('Только владельцы лошадей и тренеры могут подавать заявки на участие');
      return;
    }
    setRegisterRaceId(raceId);
    setShowRegisterModal(true);
    setSelectedHorseId('');
    setLoadingHorses(true);
    try {
      const horses = await horsesApi.getMyHorses();
      setMyHorses(horses || []);
    } catch (error) {
      console.error('Error fetching my horses:', error);
      setMyHorses([]);
    } finally {
      setLoadingHorses(false);
    }
  };

  const closeRegisterModal = () => {
    setShowRegisterModal(false);
    setRegisterRaceId(null);
    setMyHorses([]);
    setSelectedHorseId('');
  };

  const confirmRegister = async () => {
    if (!registerRaceId || !selectedHorseId) {
      alert('Выберите лошадь для участия в забеге');
      return;
    }
    try {
      setRegistering(registerRaceId);
      await racesApi.register(registerRaceId, { horseId: parseInt(selectedHorseId) });
      setRegistering(null);
      closeRegisterModal();
      alert('Заявка на участие успешно подана!');
    } catch (error: any) {
      console.error('Registration error:', error);
      setRegistering(null);
      alert('Ошибка при подаче заявки: ' + (error.message || 'Неизвестная ошибка'));
    }
  };

  const handleRegisterFromDetails = () => {
    if (selectedRace) {
      openRegisterModal(selectedRace.id);
    }
  };

  const openRaceDetails = async (race: Race) => {
    setSelectedRace(race);
    setLoadingDetails(true);
    try {
      const details = await racesApi.getById(race.id);
      setRaceDetails(details);
    } catch (error) {
      console.error('Error fetching race details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeRaceDetails = () => {
    setSelectedRace(null);
    setRaceDetails(null);
  };

  return (
    <div style={{ background: C.bgPrimary, fontFamily: "'Unbounded', sans-serif", minHeight: '100vh' }}>

      <div style={{ background: C.textPrimary, padding: '3.5rem 0 3rem' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ color: C.accentGold, fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Скаковой сезон 2026
          </p>
          <h1 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFFFFF', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginBottom: '0.75rem' }}>
            Афиша скачек
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem', maxWidth: '550px' }}>
            Расписание предстоящих забегов на ипподромах России. Подавайте заявки и следите за результатами.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        <div style={{ background: C.white, borderRadius: '12px', border: `1px solid ${C.border}`, padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center flex-1">

              <div style={{ position: 'relative' }}>
                <select
                  value={selectedHippodrome}
                  onChange={e => setSelectedHippodrome(e.target.value)}
                  style={{
                    background: C.bgSecondary, border: `1px solid ${C.border}`,
                    color: C.textPrimary, borderRadius: '8px',
                    padding: '0.5rem 2rem 0.5rem 0.875rem',
                    fontSize: '0.875rem', fontFamily: "'Unbounded', sans-serif",
                    appearance: 'none', cursor: 'pointer', minWidth: '220px',
                  }}
                >
                  {hippodromes.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: C.textMuted, pointerEvents: 'none' }} />
              </div>

              <div className="flex gap-2 flex-wrap">
                {[
                  { key: 'all', label: 'Все' },
                  { key: 'registration_open', label: 'Открытые' },
                  { key: 'scheduled', label: 'Запланированы' },
                  { key: 'finished', label: 'Завершённые' }
                ].map(s => (
                  <button
                    key={s.key}
                    onClick={() => setSelectedStatus(s.key)}
                    style={{
                      background: selectedStatus === s.key ? C.accentGold : C.bgSecondary,
                      color: selectedStatus === s.key ? C.textPrimary : C.textSecondary,
                      border: `1px solid ${selectedStatus === s.key ? C.accentGold : C.border}`,
                      borderRadius: '100px', padding: '0.4rem 1rem',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <span style={{ color: C.textMuted, fontSize: '0.875rem' }}>
              Найдено: <strong style={{ color: C.textPrimary }}>{filteredRaces.length}</strong> скачек
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div style={{ color: C.textMuted }}>Загрузка скачек...</div>
          </div>
        ) : (

          <div className="space-y-4">
            {filteredRaces.map(race => {
              const sc = statusColors[race.status] || statusColors.scheduled;
              const catColor = categoryColors[race.category] || C.textMuted;
              return (
                <div
                  key={race.id}
                  style={{
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: '12px', overflow: 'hidden',
                    transition: 'box-shadow 0.2s',
                  }}
                  className="hover:shadow-md"
                >
                  <div className="flex flex-col lg:flex-row" style={{ alignItems: 'stretch' }}>

                    <div style={{ background: C.textPrimary, padding: '1.5rem 1.75rem', minWidth: '220px', width: '220px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem', flexShrink: 0 }}>
                      <span style={{
                        background: `rgba(${catColor === C.accentGold ? '201,169,98' : catColor === '#D4A574' ? '212,165,116' : '166,123,91'},0.2)`,
                        color: catColor, border: `1px solid ${catColor}44`,
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
                        padding: '0.2rem 0.6rem', borderRadius: '4px', display: 'inline-block', alignSelf: 'flex-start',
                      }}>
                        {race.category}
                      </span>
                      <div>
                        <p style={{ color: '#FFF', fontFamily: "'Unbounded', sans-serif", fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>
                          {race.name}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: sc.dot, flexShrink: 0, display: 'block' }} />
                        <span style={{ color: sc.text, fontSize: '0.78rem', fontWeight: 600 }}>
                          {statusLabels[race.status]}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 p-5 lg:p-6" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Дата</p>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={13} style={{ color: C.accentGold }} />
                            <span style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>{formatDate(race.date)}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Дистанция</p>
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} style={{ color: C.accentGold }} />
                            <span style={{ color: C.textPrimary, fontSize: '0.875rem', fontWeight: 600 }}>{race.distance} м</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Ипподром</p>
                          <div className="flex items-start gap-1.5">
                            <MapPin size={13} style={{ color: C.accentGold, marginTop: '2px', flexShrink: 0 }} />
                            <span style={{ color: C.textPrimary, fontSize: '0.82rem', fontWeight: 600 }}>{race.hippodrome}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Призовой фонд</p>
                          <div className="flex items-center gap-1.5">
                            <Trophy size={13} style={{ color: C.accentGold }} />
                            <span style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.9rem', fontWeight: 700 }}>{formatMoney(race.prizeFund || race.prize_fund || 0)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center justify-between" style={{ marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: C.textSecondary, fontSize: '0.82rem' }}>Покрытие: <strong style={{ color: C.textPrimary }}>{race.surface}</strong></span>
                        </div>
                        <div className="flex gap-2">
                          {race.status === 'registration_open' && (
                            <button
                              onClick={() => openRegisterModal(race.id)}
                              disabled={registering === race.id}
                              style={{
                                background: registering === race.id ? C.bgSecondary : C.accentGold,
                                color: C.textPrimary,
                                border: `1px solid ${C.accentGold}`,
                                padding: '0.5rem 1.25rem', borderRadius: '8px',
                                fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s',
                                opacity: registering === race.id ? 0.7 : 1,
                              }}
                            >
                              {registering === race.id ? 'Регистрация...' : 'Подать заявку'}
                            </button>
                          )}
                          <button
                            onClick={() => openRaceDetails(race)}
                            style={{
                              background: C.bgSecondary, color: C.textPrimary,
                              border: `1px solid ${C.border}`,
                              padding: '0.5rem 1.25rem', borderRadius: '8px',
                              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Подробнее
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredRaces.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: C.textMuted, fontSize: '0.95rem' }}>По выбранным фильтрам скачек не найдено</p>
          </div>
        )}
      </div>

      {selectedRace && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }} onClick={closeRaceDetails}>
          <div 
            style={{ 
              background: C.white, borderRadius: '16px', 
              width: '100%', maxWidth: '700px', maxHeight: '90vh', overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >

            <div style={{ background: C.textPrimary, padding: '1.5rem 2rem', position: 'relative' }}>
              <button 
                onClick={closeRaceDetails}
                style={{ 
                  position: 'absolute', top: '1rem', right: '1rem',
                  background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer',
                  fontSize: '1.5rem', lineHeight: 1
                }}
              >
                ×
              </button>
              <span style={{
                background: `rgba(${categoryColors[selectedRace.category] === C.accentGold ? '201,169,98' : categoryColors[selectedRace.category] === '#D4A574' ? '212,165,116' : '166,123,91'},0.2)`,
                color: categoryColors[selectedRace.category] || C.accentGold,
                fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
                padding: '0.25rem 0.75rem', borderRadius: '4px', display: 'inline-block', marginBottom: '0.75rem'
              }}>
                {selectedRace.category}
              </span>
              <h2 style={{ fontFamily: "'Unbounded', sans-serif", color: '#FFF', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {selectedRace.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  width: '8px', height: '8px', borderRadius: '50%', 
                  background: (statusColors[selectedRace.status] || statusColors.scheduled).dot 
                }} />
                <span style={{ color: (statusColors[selectedRace.status] || statusColors.scheduled).text, fontSize: '0.85rem' }}>
                  {statusLabels[selectedRace.status]}
                </span>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: C.textMuted }}>Загрузка деталей...</p>
                </div>
              ) : (
                <>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ background: C.bgSecondary, padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Дата</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={16} style={{ color: C.accentGold }} />
                        <span style={{ color: C.textPrimary, fontWeight: 600 }}>{formatDate(selectedRace.date)}</span>
                      </div>
                    </div>
                    <div style={{ background: C.bgSecondary, padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Ипподром</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} style={{ color: C.accentGold }} />
                        <span style={{ color: C.textPrimary, fontWeight: 600 }}>{selectedRace.hippodrome}</span>
                      </div>
                    </div>
                    <div style={{ background: C.bgSecondary, padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Дистанция</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} style={{ color: C.accentGold }} />
                        <span style={{ color: C.textPrimary, fontWeight: 600 }}>{selectedRace.distance} м</span>
                      </div>
                    </div>
                    <div style={{ background: C.bgSecondary, padding: '1rem', borderRadius: '10px' }}>
                      <p style={{ color: C.textMuted, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.3rem' }}>Призовой фонд</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Trophy size={16} style={{ color: C.accentGold }} />
                        <span style={{ fontFamily: "'Unbounded', sans-serif", color: C.accentGold, fontWeight: 700 }}>
                          {formatMoney(selectedRace.prizeFund || selectedRace.prize_fund || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedRace.description && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Описание</h4>
                      <p style={{ color: C.textSecondary, fontSize: '0.85rem', lineHeight: 1.6 }}>{selectedRace.description}</p>
                    </div>
                  )}

                  {raceDetails?.participants && raceDetails.participants.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                        Участники ({raceDetails.participants.length})
                      </h4>
                      <div style={{ maxHeight: '200px', overflow: 'auto', background: C.bgSecondary, borderRadius: '10px', padding: '0.75rem' }}>
                        {raceDetails.participants.map((p: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: idx < raceDetails.participants.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                            <span style={{ color: C.textPrimary, fontWeight: 600, fontSize: '0.85rem' }}>{p.horse_name || p.horseName}</span>
                            <span style={{ color: C.textMuted, fontSize: '0.8rem' }}>
                              {p.owner_first_name ? `${p.owner_first_name} ${p.owner_last_name}` : 'Владелец не указан'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {raceDetails?.results && raceDetails.results.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>Результаты</h4>
                      <div style={{ background: C.bgSecondary, borderRadius: '10px', padding: '0.75rem' }}>
                        {raceDetails.results.map((r: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: idx < raceDetails.results.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                            <span style={{ 
                              width: '28px', height: '28px', borderRadius: '50%', 
                              background: r.position === 1 ? C.accentGold : r.position === 2 ? '#C0C0C0' : r.position === 3 ? '#CD7F32' : C.bgPrimary,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '0.8rem', color: r.position <= 3 ? '#FFF' : C.textMuted
                            }}>
                              {r.position}
                            </span>
                            <span style={{ flex: 1, color: C.textPrimary, fontWeight: 600, fontSize: '0.85rem' }}>{r.horse_name || r.horseName}</span>
                            <span style={{ color: C.accentGold, fontWeight: 600, fontSize: '0.85rem' }}>
                              {r.prize ? formatMoney(r.prize) : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedRace.status === 'registration_open' && (
                    <button
                      onClick={handleRegisterFromDetails}
                      disabled={registering === selectedRace.id}
                      style={{
                        width: '100%', background: registering === selectedRace.id ? C.bgSecondary : C.accentGold,
                        color: C.textPrimary, border: 'none', padding: '0.875rem', borderRadius: '10px',
                        fontSize: '0.95rem', fontWeight: 700, cursor: registering === selectedRace.id ? 'not-allowed' : 'pointer',
                        opacity: registering === selectedRace.id ? 0.7 : 1,
                      }}
                    >
                      {registering === selectedRace.id ? 'Регистрация...' : 'Подать заявку на участие'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showRegisterModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }} onClick={closeRegisterModal}>
          <div 
            style={{ 
              background: C.white, borderRadius: '16px', 
              width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '1.5rem', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: "'Unbounded', sans-serif", color: C.textPrimary, fontSize: '1.1rem', fontWeight: 700 }}>
                Подача заявки на участие
              </h3>
              <button 
                onClick={closeRegisterModal}
                style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {loadingHorses ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ color: C.textMuted }}>Загрузка лошадей...</p>
                </div>
              ) : myHorses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Crown size={40} style={{ color: C.border, margin: '0 auto 1rem' }} />
                  <p style={{ color: C.textMuted, fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                    У вас нет лошадей для участия в забеге
                  </p>
                  <p style={{ color: C.textSecondary, fontSize: '0.82rem' }}>
                    Добавьте лошадь в каталог, чтобы подать заявку
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p style={{ color: C.textSecondary, fontSize: '0.85rem', marginBottom: '1rem' }}>
                    Выберите лошадь, которую хотите зарегистрировать на забег:
                  </p>
                  {myHorses.map((horse: any) => (
                    <div
                      key={horse.id}
                      onClick={() => setSelectedHorseId(String(horse.id))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        padding: '1rem', borderRadius: '10px', cursor: 'pointer',
                        border: selectedHorseId === String(horse.id) ? `2px solid ${C.accentGold}` : `1px solid ${C.border}`,
                        background: selectedHorseId === String(horse.id) ? 'rgba(201,169,98,0.08)' : C.bgSecondary,
                      }}
                    >
                      <img
                        src={(() => {
                          try {
                            if (typeof horse.photos === 'string') {
                              const parsed = JSON.parse(horse.photos);
                              return parsed[0] || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                            }
                            if (Array.isArray(horse.photos)) {
                              return horse.photos[0] || 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                            }
                            return 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                          } catch {
                            return 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800';
                          }
                        })()}
                        alt={horse.name}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                      />
                      <div className="flex-1">
                        <p style={{ color: C.textPrimary, fontWeight: 700, fontSize: '0.9rem' }}>{horse.name}</p>
                        <p style={{ color: C.textMuted, fontSize: '0.78rem' }}>
                          {horse.color} · {horse.gender === 'stallion' ? 'Жеребец' : horse.gender === 'mare' ? 'Кобыла' : 'Мерин'} · {horse.birthYear} г.р.
                        </p>
                      </div>
                      {selectedHorseId === String(horse.id) && (
                        <Check size={18} style={{ color: C.accentGold, flexShrink: 0 }} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {myHorses.length > 0 && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button
                    onClick={confirmRegister}
                    disabled={!selectedHorseId || registering === registerRaceId}
                    style={{
                      flex: 1,
                      background: !selectedHorseId || registering === registerRaceId ? C.bgSecondary : C.accentGold,
                      color: C.textPrimary,
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      cursor: !selectedHorseId || registering === registerRaceId ? 'not-allowed' : 'pointer',
                      opacity: !selectedHorseId || registering === registerRaceId ? 0.7 : 1,
                    }}
                  >
                    {registering === registerRaceId ? 'Подтверждение...' : 'Подать заявку'}
                  </button>
                  <button
                    onClick={closeRegisterModal}
                    style={{
                      flex: 1,
                      background: C.bgSecondary,
                      color: C.textSecondary,
                      border: `1px solid ${C.border}`,
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Отмена
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
