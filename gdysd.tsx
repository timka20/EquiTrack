import { AnimateOnScroll } from '@/components/AnimateOnScroll';
import { ShieldCheck, Zap, QrCode, MessageCircle, ExternalLink, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Benefit {
  title: string;
  description: string;
  icon: React.ElementType;
}

const benefits: Benefit[] = [
  {
    title: 'Полностью бесплатно',
    description: 'Никаких подписок или скрытых платежей за использование.',
    icon: Zap,
  },
  {
    title: 'Стабильность',
    description: 'Работает 24/7, обеспечивая бесперебойный доступ к мессенджеру.',
    icon: ShieldCheck,
  },
  {
    title: 'Конфиденциальность',
    description: 'Прокси не хранит ваши данные и не перехватывает трафик.',
    icon: Globe,
  },
];

const ProxyPage = () => {
  const proxyLink = "https://t.me/proxy?server=tg.proxy.timka20.ru&port=5443&secret=b5537f367d64d194416a8aa0e6d3bb0c";
  const supportLink = "https://t.me/timka2O";
  const qrCodeUrl = "https://upload.timka20.ru/files/dad11ce1b09e.jpeg";

  return (
    <div className="min-h-screen py-12 md:py-20 bg-background text-foreground">
      <div className="container mx-auto px-4">

        <AnimateOnScroll>
          <div className="text-center mb-12 md:mb-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Telegram <span className="gradient-text">Proxy</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Стабильный и быстрый доступ к Telegram из любой точки мира.
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid lg:grid-cols-2 gap-8 items-start">

          <AnimateOnScroll delay={100}>
            <div className="glass-card p-6 md:p-8 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                <QrCode className="w-6 h-6 text-primary" />
                Подключение
              </h2>

              <div className="relative mb-6 flex justify-center w-full">

                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full w-48 h-48 mx-auto -z-10"></div>

                <div className="relative bg-white p-3 rounded-2xl shadow-xl">
                  <img 
                    src={qrCodeUrl} 
                    alt="Proxy QR Code" 
                    className="w-48 h-48 md:w-60 md:h-60 object-contain rounded-lg"
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-8">
                Отсканируйте камерой телефона
              </p>

              <div className="w-full space-y-4 max-w-sm mx-auto">
                <a href={proxyLink} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <Button size="lg" className="w-full gap-2 text-md font-bold h-14 bg-primary hover:opacity-90">
                    Подключить в 1 клик
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>

                <p className="text-[11px] leading-relaxed text-muted-foreground uppercase tracking-wider opacity-70">
                  Нажимая кнопку, ваш Telegram предложит добавить прокси-сервер автоматически.
                </p>
              </div>
            </div>
          </AnimateOnScroll>

          <div className="space-y-6">
            <AnimateOnScroll delay={200}>
              <div className="glass-card p-8 h-full">
                <h2 className="text-2xl font-bold mb-6">Преимущества</h2>
                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <benefit.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-base">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300}>
              <div className="glass-card p-6 md:p-8 border-primary/20 bg-primary/5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div>
                    <h2 className="text-xl font-bold mb-1 flex items-center justify-center sm:justify-start gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      Поддержка
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Есть вопросы? Пишите в личные сообщения.
                    </p>
                  </div>
                  <a href={supportLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                      Написать
                    </Button>
                  </a>
                </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>

        <AnimateOnScroll delay={400}>
          <div className="mt-12 text-center opacity-50">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.2em]">
              Powered by MTProto Technology • Secure & Fast
            </p>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
};

export default ProxyPage;
