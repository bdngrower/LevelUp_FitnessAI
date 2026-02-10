import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Dumbbell, TrendingUp, Calendar, UserIcon, Settings, Search, Menu, HistoryIcon } from './Icons';
import { Logo } from './Logo';
import { cn } from '../utils/cn';
import { StorageService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, loading } = useAuth();

  // Hide Navigation on specific flows
  const hideNav = location.pathname === '/' || location.pathname === '/onboarding' || location.pathname.startsWith('/workout/');

  if (loading) return <div className="h-screen w-screen bg-background" />; // Or a spinner

  const isAuth = !!session;

  const user = StorageService.getProfile();

  const navItems = [
    { to: "/", icon: Dumbbell, label: "Início" },
    { to: "/plan", icon: Calendar, label: "Plano" },
    { to: "/progress", icon: TrendingUp, label: "Progresso" },
    { to: "/profile", icon: UserIcon, label: "Perfil" },
    { to: "/settings", icon: Settings, label: "Config" },
  ];

  const NavItem = ({ to, icon: Icon, label, mobile = false }: { to: string, icon: any, label: string, mobile?: boolean }) => {
    const isActive = location.pathname === to;

    if (mobile) {
      return (
        <Link to={to} className={cn("flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200", isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground')}>
          <Icon className={cn("w-6 h-6", isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
          <span className="text-[10px] font-medium tracking-wide">{label}</span>
        </Link>
      );
    }

    return (
      <Link to={to} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group", isActive ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
        <Icon className={cn("w-5 h-5", isActive ? 'stroke-[2.5px]' : 'stroke-2')} />
        <span className="text-sm">{label}</span>
        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
      </Link>
    );
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      alert("Busca global em breve!");
    }
  }

  if (!isAuth) {
    return (
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden">

      {/* Desktop Sidebar */}
      {!hideNav && (
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-xl p-4 shrink-0">
          <div className="px-2 mb-8 mt-2">
            <div className="flex items-center gap-3">
              <Logo className="h-8 w-auto" />
              <span className="font-bold text-lg tracking-tight">LevelUp<span className="text-primary">.AI</span></span>
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="text-xs font-bold text-muted-foreground px-3 mb-2 uppercase tracking-wider">Menu Principal</div>
            {navItems.slice(0, 3).map(item => <NavItem key={item.to} {...item} />)}

            <div className="text-xs font-bold text-muted-foreground px-3 mb-2 mt-6 uppercase tracking-wider">Conta</div>
            {navItems.slice(3).map(item => <NavItem key={item.to} {...item} />)}
          </div>

          <div className="mt-auto bg-secondary/50 dark:bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-border">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-green-400 flex items-center justify-center text-white font-bold text-xs border-2 border-background">
              {user?.name?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold truncate">{user?.name || "Usuário"}</span>
              <span className="text-xs text-muted-foreground truncate">Nível {user?.experience === 'beginner' ? 'I' : user?.experience === 'intermediate' ? 'II' : 'III'}</span>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">

        {/* Desktop/Tablet Header */}
        {!hideNav && (
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-20">
            <div className="lg:hidden flex items-center gap-2">
              <Logo className="h-8 w-auto" />
              <span className="font-bold text-lg tracking-tight">LevelUp<span className="text-primary">.AI</span></span>
            </div>

            {/* Breadcrumbs / Page Title Placeholder */}
            <div className="hidden lg:flex items-center text-sm font-medium text-muted-foreground">
              <span className="text-foreground">Dashboard</span>
            </div>

            {/* Global Search & Actions */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="relative hidden sm:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar exercícios..."
                  className="h-9 w-64 rounded-full border border-input bg-secondary/50 dark:bg-secondary/20 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                  onKeyDown={handleSearch}
                />
              </div>

              <button className="relative p-2 rounded-full hover:bg-accent text-muted-foreground transition-colors">
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                {/* Assuming Notification logic later */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              </button>

              {/* Mobile Avatar Placeholder (if needed, or menu) */}
              <div className="lg:hidden w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0] || "U"}
              </div>
            </div>
          </header>
        )}

        <main className={cn("flex-1 overflow-y-auto no-scrollbar", !hideNav && "pb-20 lg:pb-0")}>
          {children}
        </main>

        {/* Mobile Bottom Nav */}
        {!hideNav && (
          <nav className="lg:hidden fixed bottom-0 w-full h-[65px] bg-card/95 backdrop-blur-xl border-t border-border flex justify-around items-center px-2 z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            {navItems.slice(0, 5).map(item => <NavItem key={item.to} mobile {...item} />)}
          </nav>
        )}
      </div>
    </div>
  );
};