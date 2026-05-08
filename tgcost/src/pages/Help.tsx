import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Search,
  MessageCircle,
  Phone,
  Mail,
  FileText,
  Shield,
  CreditCard,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Help() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: <Search className="h-5 w-5" />,
      title: 'Поиск площадок',
      description: 'Как найти и выбрать подходящую рекламную площадку',
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      title: 'Бронирование',
      description: 'Как забронировать площадку и управлять бронированиями',
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      title: 'Оплата',
      description: 'Способы оплаты и возврат средств',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: 'Макеты',
      description: 'Требования к рекламным макетам и модерация',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Безопасность',
      description: 'Защита данных и безопасность сделок',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero px-4 pb-6 pt-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Помощь</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Найдите ответы на частые вопросы или свяжитесь с нами
        </p>
      </motion.div>

      <div className="p-4 space-y-6">
        {}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Популярные темы
          </h2>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{section.title}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Связаться с нами
          </h2>
          <div className="space-y-2">
            <ContactItem
              icon={<MessageCircle className="h-5 w-5" />}
              title="Чат поддержки"
              value="Написать в Telegram"
              onClick={() => window.open('https://t.me/tgcost_support', '_blank')}
            />
            <ContactItem
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              value="support@tgcost.ru"
              onClick={() => window.location.href = 'mailto:support@tgcost.ru'}
            />
            <ContactItem
              icon={<Phone className="h-5 w-5" />}
              title="Телефон"
              value="+7 (800) 555-35-35"
              onClick={() => window.location.href = 'tel:+78005553535'}
            />
          </div>
        </section>

        {}
        <section className="rounded-xl bg-muted/50 p-4">
          <h3 className="font-medium mb-2">Часы работы поддержки</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Пн-Пт: 9:00 - 21:00</p>
            <p>Сб-Вс: 10:00 - 18:00</p>
            <p className="text-xs mt-2">Московское время (GMT+3)</p>
          </div>
        </section>
      </div>
    </div>
  );
}

interface ContactItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  onClick: () => void;
}

function ContactItem({ icon, title, value, onClick }: ContactItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
    >
      <div className="text-primary">{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-primary">{value}</p>
      </div>
    </button>
  );
}
