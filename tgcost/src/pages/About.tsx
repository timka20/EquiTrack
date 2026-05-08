import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Heart,
  Globe,
  Shield,
  Zap,
  Users,
  Star,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function About() {
  const navigate = useNavigate();

  const stats = [
    { value: '500+', label: 'Площадок' },
    { value: '1000+', label: 'Клиентов' },
    { value: '50+', label: 'Городов' },
    { value: '99%', label: 'Довольных' },
  ];

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: 'Все города России',
      description: 'Рекламные площадки в Москве, СПб и других городах'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Быстрое бронирование',
      description: 'Забронируйте площадку за 5 минут онлайн'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Безопасность',
      description: 'Гарантия размещения и защита платежей'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Прямая связь',
      description: 'Общайтесь с владельцами без посредников'
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero px-4 pb-8 pt-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">О приложении</h1>
        </div>

        {}
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
            TG
          </div>
          <h2 className="text-2xl font-bold">TGCost</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Платформа офлайн рекламы
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Версия 1.0.0 (build 2024.02.11)
          </p>
        </div>
      </motion.div>

      <div className="p-4 space-y-8">
        {}
        <section>
          <p className="text-center text-muted-foreground">
            TGCost — современная платформа для поиска и бронирования рекламных площадок.
            Мы объединяем рекламодателей и владельцев билбордов, экранов и других носителей
            в одном удобном приложении.
          </p>
        </section>

        {}
        <section className="grid grid-cols-4 gap-2">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="text-center"
            >
              <p className="text-xl font-bold text-primary">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </section>

        {}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Преимущества
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border p-4"
              >
                <div className="text-primary mb-2">{feature.icon}</div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Как это работает
          </h3>
          <div className="space-y-3">
            <Step number={1} title="Найдите площадку" description="Используйте фильтры по городу, типу и цене" />
            <Step number={2} title="Забронируйте" description="Выберите даты и загрузите макет" />
            <Step number={3} title="Получите результат" description="Отслеживайте размещение в личном кабинете" />
          </div>
        </section>

        {}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Полезные ссылки
          </h3>
          <LinkItem
            title="Политика конфиденциальности"
            onClick={() => navigate('/privacy')}
          />
          <LinkItem
            title="Условия использования"
            onClick={() => navigate('/terms')}
          />
          <LinkItem
            title="Официальный сайт"
            onClick={() => window.open('https://tgcost.ru', '_blank')}
            external
          />
        </section>

        {}
        <section className="text-center pt-4">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Сделано с <Heart className="h-4 w-4 text-destructive fill-destructive" /> в России
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            © 2024 TGCost. Все права защищены.
          </p>
        </section>
      </div>
    </div>
  );
}

interface StepProps {
  number: number;
  title: string;
  description: string;
}

function Step({ number, title, description }: StepProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
        {number}
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface LinkItemProps {
  title: string;
  onClick: () => void;
  external?: boolean;
}

function LinkItem({ title, onClick, external }: LinkItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted"
    >
      <span className="text-sm">{title}</span>
      {external ? (
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      ) : (
        <ChevronLeft className="h-4 w-4 text-muted-foreground -rotate-180" />
      )}
    </button>
  );
}
