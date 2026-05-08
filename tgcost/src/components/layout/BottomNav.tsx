import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

const navItems = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/search', icon: Search, label: 'Поиск' },
  { path: '/favorites', icon: Heart, label: 'Избранное' },
  { path: '/profile', icon: User, label: 'Профиль' },
];

const adminNavItems = [
  { path: '/', icon: Home, label: 'Главная' },
  { path: '/search', icon: Search, label: 'Поиск' },
  { path: '/admin', icon: Settings, label: 'Админ' },
  { path: '/profile', icon: User, label: 'Профиль' },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuthStore();

  const items = user?.role === 'admin' || user?.role === 'moderator'
    ? adminNavItems
    : navItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {items.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'scale-110')} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
