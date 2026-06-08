import { createBrowserRouter, Outlet } from 'react-router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Races from './pages/Races';
import Results from './pages/Results';
import Catalog from './pages/Catalog';
import Breeding from './pages/Breeding';
import Dashboard from './pages/Dashboard';
import HorseDetail from './pages/HorseDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Favorites from './pages/Favorites';
import { CircleDot } from 'lucide-react';
import { C } from './data/colors';

function Root() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, paddingTop: '80px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function AuthLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Unbounded', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(201,169,98,0.15)', border: '1px solid rgba(201,169,98,0.3)' }}>
          <CircleDot size={40} style={{ color: C.accentGold }} />
        </div>
        <h2 style={{ fontFamily: "'Unbounded', sans-serif", fontSize: '2rem', fontWeight: 700, color: '#3D3225', marginBottom: '0.75rem' }}>
          Страница не найдена
        </h2>
        <p style={{ color: '#7A6B5A', marginBottom: '1.5rem' }}>Похоже, эта лошадь ускакала...</p>
        <a href="/" style={{ background: '#C9A962', color: '#3D3225', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 700, textDecoration: 'none' }}>
          На главную
        </a>
      </div>
    </div>
  );
}

function ProtectedDashboard() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: 'races', Component: Races },
      { path: 'results', Component: Results },
      { path: 'catalog', Component: Catalog },
      { path: 'breeding', Component: Breeding },
      { path: 'dashboard', Component: ProtectedDashboard },
      { path: 'favorites', Component: Favorites },
      { path: 'horse/:id', Component: HorseDetail },
      { path: '*', Component: NotFound },
    ],
  },
  {
    path: '/',
    Component: AuthLayout,
    children: [
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
      { path: 'forgot-password', Component: ForgotPassword },
    ],
  },
]);
