import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    category: 'Общие',
    question: 'Что такое TGCost?',
    answer: 'TGCost — это платформа для поиска и бронирования офлайн рекламных площадок: билбордов, цифровых экранов, стен и других носителей. Мы соединяем рекламодателей с владельцами рекламных мест.'
  },
  {
    category: 'Общие',
    question: 'Как зарегистрироваться?',
    answer: 'Нажмите кнопку "Регистрация" на главном экране, выберите тип аккаунта (рекламодатель или владелец), заполните email и пароль. После подтверждения email вы сможете использовать все функции платформы.'
  },
  {
    category: 'Рекламодателям',
    question: 'Как найти подходящую площадку?',
    answer: 'Используйте фильтры по типу (билборд, экран, стена), городу и цене. На карте отображаются все доступные площадки с фото, характеристиками и ценами. Вы также можете отфильтровать по трафику и освещению.'
  },
  {
    category: 'Рекламодателям',
    question: 'Как забронировать площадку?',
    answer: 'Выберите площадку, нажмите "Забронировать", выберите даты размещения в календаре и загрузите рекламный макет. После модерации макета площадка будет забронирована за вами.'
  },
  {
    category: 'Рекламодателям',
    question: 'Какие требования к макетам?',
    answer: 'Формат: JPG, PNG или PDF. Разрешение: от 150 dpi. Размер зависит от формата площадки. Макет должен соответствовать законодательству РФ о рекламе (нет запрещенной продукции, соблюдение размеров шрифтов).'
  },
  {
    category: 'Рекламодателям',
    question: 'Сколько стоит размещение?',
    answer: 'Цены указаны за сутки размещения и зависят от локации, трафика и типа площадки. Минимальный срок — обычно 7 дней. Скидки при бронировании от 30 дней.'
  },
  {
    category: 'Владельцам',
    question: 'Как добавить свою площадку?',
    answer: 'Зарегистрируйтесь как владелец, перейдите в раздел "Мои площадки", нажмите "Добавить площадку". Заполните информацию: адрес, тип, размеры, фото. После модерации площадка появится в каталоге.'
  },
  {
    category: 'Владельцам',
    question: 'Как получить выплату?',
    answer: 'Выплаты производятся на банковскую карту или расчетный счет в течение 3 рабочих дней после окончания размещения рекламы. Комиссия платформы — 10%.'
  },
  {
    category: 'Оплата',
    question: 'Способы оплаты',
    answer: 'Принимаем банковские карты Visa, MasterCard, МИР, а также безналичный расчет для юридических лиц. Оплата производится после одобрения макета.'
  },
  {
    category: 'Оплата',
    question: 'Возврат средств',
    answer: 'Возврат возможен за неиспользованные дни размещения при отмене за 48 часов до начала. Комиссия платформы не возвращается. При отмене менее чем за 48 часов — возврат 50%.'
  },
  {
    category: 'Техническая поддержка',
    question: 'Как связаться с поддержкой?',
    answer: 'Напишите нам в Telegram @tgcost_support, на email support@tgcost.ru или позвоните по телефону +7 (800) 555-35-35. Мы работаем ежедневно с 9:00 до 21:00 по московскому времени.'
  },
];

const categories = ['Все', 'Общие', 'Рекламодателям', 'Владельцам', 'Оплата', 'Техническая поддержка'];

export default function FAQ() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-lg font-bold">FAQ</h1>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Часто задаваемые вопросы
        </p>
      </motion.div>

      <div className="p-4 space-y-4">
        {}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск вопросов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {}
        <div className="space-y-2">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Ничего не найдено</p>
              <p className="text-sm">Попробуйте другой запрос</p>
            </div>
          ) : (
            filteredFAQ.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="rounded-xl border border-border overflow-hidden"
              >
                <button
                  onClick={() => setOpenItem(openItem === item.question ? null : item.question)}
                  className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium pr-4">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                      openItem === item.question ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openItem === item.question && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border/50 pt-3">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
