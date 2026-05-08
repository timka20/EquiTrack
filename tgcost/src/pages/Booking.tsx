import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, CreditCard, Check, ChevronLeft, ChevronRight, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePlatformsStore } from '@/store/usePlatformsStore';
import { useBookingsStore } from '@/store/useBookingsStore';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isBefore, isAfter, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

type BookingStep = 'dates' | 'payment' | 'upload' | 'success';

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<BookingStep>('dates');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [companyName, setCompanyName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { currentPlatform: platform, fetchPlatform } = usePlatformsStore();
  const { addBooking } = useBookingsStore();

  useEffect(() => {
    if (id) {
      fetchPlatform(id);
    }
  }, [id, fetchPlatform]);

  const bookedDates = useMemo(() => {
    return platform?.bookedDates?.map((d: string) => new Date(d)) || [];
  }, [platform]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfWeek = useMemo(() => {
    const start = startOfMonth(currentMonth);
    return start.getDay() === 0 ? 6 : start.getDay() - 1;
  }, [currentMonth]);

  const isDateBooked = (date: Date) => {
    return bookedDates.some((d: Date) => isSameDay(d, date));
  };

  const isDateInRange = (date: Date) => {
    if (!selectedDates.start || !selectedDates.end) return false;
    return isAfter(date, selectedDates.start) && isBefore(date, selectedDates.end);
  };

  const handleDateClick = (date: Date) => {
    if (isBefore(date, new Date()) || isDateBooked(date)) return;

    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {

      setSelectedDates({ start: date, end: null });
    } else {

      if (isSameDay(date, selectedDates.start)) {

        setSelectedDates({ start: date, end: date });
      } else if (isBefore(date, selectedDates.start)) {

        setSelectedDates({ start: date, end: selectedDates.start });
      } else {

        setSelectedDates({ ...selectedDates, end: date });
      }

      setTimeout(() => setStep('payment'), 300);
    }
  };

  const totalDays = useMemo(() => {
    if (!selectedDates.start || !selectedDates.end) return 0;
    const diff = selectedDates.end.getTime() - selectedDates.start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }, [selectedDates]);

  const totalPrice = useMemo(() => {
    return totalDays * (platform?.pricePerDay || 0);
  }, [totalDays, platform]);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.join(' ') || v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    if (!platform || !selectedDates.start || !selectedDates.end) return;

    if (cardNumber.replace(/\s/g, '').length < 16) {
      toast({ title: 'Ошибка', description: 'Введите полный номер карты', variant: 'destructive' });
      return;
    }
    if (cardHolder.length < 3) {
      toast({ title: 'Ошибка', description: 'Введите имя держателя карты', variant: 'destructive' });
      return;
    }
    if (cardExpiry.length < 5) {
      toast({ title: 'Ошибка', description: 'Введите срок действия карты', variant: 'destructive' });
      return;
    }
    if (cardCvv.length < 3) {
      toast({ title: 'Ошибка', description: 'Введите CVV код', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await addBooking({
        platformId: platform.id,
        startDate: selectedDates.start.toISOString().split('T')[0],
        endDate: selectedDates.end.toISOString().split('T')[0],
        totalPrice
      });

      setStep('upload');
      toast({ title: 'Успех', description: 'Оплата прошла успешно!' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Что-то пошло не так. Попробуйте еще раз.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Ошибка', description: 'Файл слишком большой (макс 10MB)', variant: 'destructive' });
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadMaterial = async () => {
    if (!companyName.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название компании', variant: 'destructive' });
      return;
    }
    if (!selectedFile) {
      toast({ title: 'Ошибка', description: 'Выберите файл макета', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsProcessing(false);
    setStep('success');
    toast({ title: 'Успех', description: 'Макет отправлен на модерацию!' });
  };

  const handleBack = () => {
    if (step === 'payment') {
      setStep('dates');
    } else if (step === 'upload') {
      setStep('payment');
    } else {
      navigate(-1);
    }
  };

  if (!platform) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const price = typeof platform.pricePerDay === 'number' ? platform.pricePerDay : 0;

  return (
    <div className="min-h-screen bg-background pb-40 md:pb-28">
      {}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-lg">
        <div className="flex items-center gap-4 px-4 py-3">
          <button onClick={handleBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">
            {step === 'dates' && 'Выбор дат'}
            {step === 'payment' && 'Оплата'}
            {step === 'upload' && 'Загрузка макета'}
            {step === 'success' && 'Готово'}
          </h1>
        </div>

        {}
        <div className="flex gap-2 px-4 pb-3">
          {['dates', 'payment', 'upload', 'success'].slice(0, step === 'success' ? 4 : 3).map((s, i) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                ['dates', 'payment', 'upload', 'success'].indexOf(step) >= i
                  ? 'bg-primary'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex gap-3">
          <img
            src={platform.image || 'https://via.placeholder.com/100?text=No+Image'}
            alt={platform.name}
            className="h-16 w-16 rounded-xl object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=No+Image';
            }}
          />
          <div>
            <h2 className="font-medium">{platform.name}</h2>
            <p className="text-xs text-muted-foreground">{platform.address || 'Адрес не указан'}</p>
            {price > 0 && (
              <p className="mt-1 text-sm font-semibold text-primary">
                {price.toLocaleString('ru-RU')} ₽ / сутки
              </p>
            )}
          </div>
        </div>
      </div>

      {}
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="p-4"
      >
        {step === 'dates' && (
          <div>
            {}
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-sm font-semibold capitalize">
                {format(currentMonth, 'LLLL yyyy', { locale: ru })}
              </h3>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {}
            <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            {}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {days.map((day) => {
                const isPast = isBefore(day, new Date()) && !isToday(day);
                const isBooked = isDateBooked(day);
                const isStart = selectedDates.start && isSameDay(day, selectedDates.start);
                const isEnd = selectedDates.end && isSameDay(day, selectedDates.end);
                const inRange = isDateInRange(day);
                const isSelected = isStart || isEnd;

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast || isBooked}
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all ${
                      isPast
                        ? 'text-muted-foreground/40'
                        : isBooked
                        ? 'bg-muted text-muted-foreground line-through'
                        : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : inRange
                        ? 'bg-primary/20 text-primary'
                        : isToday(day)
                        ? 'border border-primary text-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-muted" />
                <span>Занято</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded bg-primary" />
                <span>Выбрано</span>
              </div>
            </div>

            {}
            <motion.div
              initial={false}
              animate={{ opacity: selectedDates.start ? 1 : 0, y: selectedDates.start ? 0 : 10 }}
              className="mt-4 rounded-2xl bg-muted/50 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {selectedDates.start ? format(selectedDates.start, 'd MMM', { locale: ru }) : '—'}
                    {' — '}
                    {selectedDates.end ? format(selectedDates.end, 'd MMM', { locale: ru }) : '—'}
                  </span>
                </div>
                {totalDays > 0 && (
                  <span className="text-sm font-medium">{totalDays} дней</span>
                )}
              </div>
              {!selectedDates.end && selectedDates.start && (
                <p className="mt-2 text-xs text-primary font-medium">
                  Выберите дату окончания
                </p>
              )}
            </motion.div>
          </div>
        )}

        {step === 'payment' && (
          <div>
            {}
            <div className="mb-6 rounded-2xl border border-border p-4">
              <h3 className="mb-4 text-sm font-semibold">Детали бронирования</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Площадка</span>
                  <span>{platform.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Даты</span>
                  <span>
                    {selectedDates.start && format(selectedDates.start, 'd MMM', { locale: ru })} — {selectedDates.end && format(selectedDates.end, 'd MMM', { locale: ru })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Дней</span>
                  <span>{totalDays}</span>
                </div>
                {price > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Цена за сутки</span>
                      <span>{price.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    <div className="border-t border-border pt-2">
                      <div className="flex justify-between text-base font-semibold">
                        <span>Итого</span>
                        <span>{(totalPrice ?? 0).toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {}
            <div className="mb-6 space-y-4">
              <h3 className="text-sm font-semibold">Данные карты</h3>

              <div>
                <Label htmlFor="cardNumber">Номер карты</Label>
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="cardHolder">Имя держателя карты</Label>
                <Input
                  id="cardHolder"
                  placeholder="IVAN IVANOV"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Срок действия</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    maxLength={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div>
            <div className="mb-6">
              <h3 className="mb-4 text-sm font-semibold">Информация о рекламодателе</h3>

              <div className="mb-4">
                <Label htmlFor="companyName">Название компании *</Label>
                <Input
                  id="companyName"
                  placeholder="ООО Рекламные Технологии"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="mb-4 text-sm font-semibold">Рекламный макет *</h3>

              <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
                {previewUrl ? (
                  <div className="space-y-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mx-auto max-h-48 rounded-lg object-contain"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      Выбрать другой файл
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium">Нажмите чтобы загрузить</p>
                      <p className="text-xs text-muted-foreground">JPG, PNG или PDF до 10MB</p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-muted/50 p-4 text-sm">
              <h4 className="mb-2 font-medium">Требования к макету:</h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Формат: JPG, PNG или PDF</li>
                <li>• Разрешение: от 150 dpi</li>
                <li>• Размер соответствует формату площадки</li>
                <li>• Соответствие законодательству о рекламе</li>
              </ul>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center px-4 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10"
            >
              <Check className="h-10 w-10 text-success" />
            </motion.div>
            <h2 className="mb-2 text-xl font-bold">Бронирование подтверждено!</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Макет отправлен на модерацию. Мы уведомим вас о результате проверки.
            </p>
            <Button onClick={() => navigate('/profile')} className="w-full" size="lg">
              Перейти в профиль
            </Button>
          </div>
        )}
      </motion.div>

      {}
      {step !== 'success' && (
        <div className="fixed bottom-[72px] left-0 right-0 border-t border-border bg-card/95 p-4 backdrop-blur-lg safe-area-bottom z-[60] md:bottom-0">
          {step === 'dates' && (
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold">
                  {(totalPrice ?? 0) > 0 ? `${(totalPrice ?? 0).toLocaleString('ru-RU')} ₽` : '—'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalDays > 0 ? `${totalDays} дней` : 'Выберите даты'}
                </p>
              </div>
              <Button
                className="flex-1"
                size="lg"
                disabled={!selectedDates.start || !selectedDates.end || isProcessing}
                onClick={() => setStep('payment')}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Продолжить'
                )}
              </Button>
            </div>
          )}

          {step === 'payment' && (
            <Button
              className="w-full"
              size="lg"
              disabled={isProcessing}
              onClick={handlePayment}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обработка...
                </>
              ) : (
                price > 0 ? `Оплатить ${(totalPrice ?? 0).toLocaleString('ru-RU')} ₽` : 'Подтвердить'
              )}
            </Button>
          )}

          {step === 'upload' && (
            <Button
              className="w-full"
              size="lg"
              disabled={isProcessing || !selectedFile || !companyName.trim()}
              onClick={handleUploadMaterial}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Загрузка...
                </>
              ) : (
                'Отправить на модерацию'
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
