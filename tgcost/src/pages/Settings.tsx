import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Bell,
  Moon,
  Globe,
  HelpCircle,
  Info,
  ChevronRight,
  Smartphone,
  LogOut,
  Sun,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuthStore } from '@/store/useAuthStore';

export default function Settings() {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    darkMode: false,
    autoUpdate: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('tgcost_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(prev => ({ ...prev, ...parsed }));

      if (parsed.darkMode) {
        document.documentElement.classList.add('dark');
      }
    } else {

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        setSettings(prev => ({ ...prev, darkMode: true }));
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  const saveSettings = (newSettings: typeof settings) => {
    localStorage.setItem('tgcost_settings', JSON.stringify(newSettings));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSetting = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    saveSettings(newSettings);

    if (key === 'darkMode') {
      if (newSettings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="gradient-hero px-4 pb-4 pt-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Настройки</h1>
        </div>
      </motion.div>

      <div className="p-4 space-y-6">
        {}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Уведомления
          </h2>
          <div className="space-y-1">
            <SettingItem
              icon={<Bell className="h-5 w-5" />}
              label="Push-уведомления"
              action={
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={() => toggleSetting('pushNotifications')}
                />
              }
            />
            <SettingItem
              icon={<Globe className="h-5 w-5" />}
              label="Email-уведомления"
              action={
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => toggleSetting('emailNotifications')}
                />
              }
            />
          </div>
        </section>

        {}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Внешний вид
          </h2>
          <div className="space-y-1">
            <SettingItem
              icon={settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              label={settings.darkMode ? "Тёмная тема" : "Светлая тема"}
              description="Переключить оформление"
              action={
                <Switch
                  checked={settings.darkMode}
                  onCheckedChange={() => toggleSetting('darkMode')}
                />
              }
            />
          </div>
        </section>

        {}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Приложение
          </h2>
          <div className="space-y-1">
            <SettingItem
              icon={<Smartphone className="h-5 w-5" />}
              label="Автообновление"
              description="Обновлять данные автоматически"
              action={
                <Switch
                  checked={settings.autoUpdate}
                  onCheckedChange={() => toggleSetting('autoUpdate')}
                />
              }
            />
          </div>
        </section>

        {}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Поддержка
          </h2>
          <div className="space-y-1">
            <SettingItem
              icon={<HelpCircle className="h-5 w-5" />}
              label="Помощь"
              onClick={() => navigate('/help')}
            />
            <SettingItem
              icon={<FileText className="h-5 w-5" />}
              label="FAQ"
              onClick={() => navigate('/faq')}
            />
            <SettingItem
              icon={<MessageCircle className="h-5 w-5" />}
              label="О приложении"
              onClick={() => navigate('/about')}
            />
          </div>
        </section>

        {}
        <section>
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground text-center">
              TGCost v1.0.0 • build 2024.02.11
            </p>
          </div>
        </section>

        {}
        <section className="pt-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти из аккаунта
          </Button>
        </section>
      </div>
    </div>
  );
}

interface SettingItemProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  action?: React.ReactNode;
  onClick?: () => void;
}

function SettingItem({ icon, label, description, action, onClick }: SettingItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"
    >
      <div className="text-primary">{icon}</div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{label}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action || (onClick && <ChevronRight className="h-5 w-5 text-muted-foreground" />)}
    </button>
  );
}
