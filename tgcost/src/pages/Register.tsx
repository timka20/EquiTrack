import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore, type UserRole } from '@/store/useAuthStore';

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('advertiser');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await register({
      email,
      password,
      name,
      role
    });

    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Назад
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl text-primary-foreground font-bold">
            TG
          </div>
          <h1 className="text-2xl font-bold text-foreground">Регистрация</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Создайте аккаунт в TGCost
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {}
          <div>
            <Label>Выберите роль</Label>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <RoleCard
                title="Рекламодатель"
                description="Ищу площадки для рекламы"
                icon="📢"
                selected={role === 'advertiser'}
                onClick={() => setRole('advertiser')}
              />
              <RoleCard
                title="Владелец"
                description="Сдаю рекламные места"
                icon="🏢"
                selected={role === 'owner'}
                onClick={() => setRole('owner')}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="password">Пароль</Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Минимум 6 символов"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading || !name || !email || password.length < 6}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Регистрация...
              </>
            ) : (
              'Зарегистрироваться'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="font-medium text-primary">
            Войдите
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

interface RoleCardProps {
  title: string;
  description: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}

function RoleCard({ title, description, icon, selected, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      {selected && (
        <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
          <Check className="h-3 w-3 text-primary-foreground" />
        </div>
      )}
      <span className="text-2xl">{icon}</span>
      <p className="mt-2 text-sm font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </button>
  );
}
