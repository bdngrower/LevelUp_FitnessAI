import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Dumbbell, TrendingUp, Calendar, UserIcon, Settings, Search, Menu, HistoryIcon, LogOut } from './Icons';
import { Logo } from './Logo';
import { cn } from '../utils/cn';
import { StorageService } from '../services/storage';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, loading, signOut } = useAuth();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Hide Navigation on specific flows
  const hideNav = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/onboarding' || location.pathname.startsWith('/workout/');

  if (loading) return <LoadingScreen />;

  const isAuth = !!session;

  const user = StorageService.getProfile();

  // Onboarding Guard: Force profile completion
  React.useEffect(() => {
    if (session && user && location.pathname !== '/onboarding' && location.pathname !== '/login' && location.pathname !== '/') {
      const isProfileComplete =
        user.name &&
        user.phone &&
        user.height &&
        user.weight &&
        user.age &&
        user.gender;

      if (!isProfileComplete) {
        navigate('/onboarding');
      }
    }
  }, [session, user, location.pathname, navigate]);

  const navItems = [
    { to: "/dashboard", icon: Dumbbell, label: "Início" },
    { to: "/plan", icon: Calendar, label: "Plano" },
    { to: "/progress", icon: TrendingUp, label: "Progresso" },
    { to: "/history", icon: HistoryIcon, label: "Histórico" },
    { to: "/profile", icon: UserIcon, label: "Perfil" },
    { to: "/settings", icon: Settings, label: "Config" },
  ];

  const NavItem = ({ to, icon: Icon, label, mobile = false, ...rest }: { to: string, icon: any, label: string, mobile?: boolean, [key: string]: any }) => {
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
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden selection:bg-primary/20">

      {/* Desktop Sidebar */}
      {!hideNav && (
        <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-xl p-4 shrink-0 transition-all duration-300">
          <div className="px-2 mb-8 mt-2">
            <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Logo className="h-10 w-auto" />
              <span className="font-black text-xl tracking-tighter">LevelUp<span className="text-primary">.AI</span></span>
            </Link>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="text-[10px] font-extrabold text-muted-foreground/60 px-3 mb-2 uppercase tracking-widest">Menu Principal</div>
            {navItems.slice(0, 3).map(item => <NavItem key={item.to} {...item} />)}

            <div className="text-[10px] font-extrabold text-muted-foreground/60 px-3 mb-2 mt-8 uppercase tracking-widest">Conta</div>
            {navItems.slice(3).map(item => <NavItem key={item.to} {...item} />)}
          </div>

          <button
            onClick={() => signOut()}
            className="mt-auto w-full flex items-center gap-3 px-3 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200 border border-transparent hover:border-destructive/10 group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold">Sair da Conta</span>
          </button>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">

        {/* Header (Desktop & Core Mobile) */}
        {!hideNav && (
          <header className="h-16 md:h-18 border-b border-border/60 bg-background/80 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-all">
            <div className="flex items-center gap-3 lg:hidden">
              <button onClick={toggleMobileMenu} className="p-2 -ml-2 rounded-xl hover:bg-secondary text-foreground active:scale-95 transition-all">
                <Menu className="w-6 h-6" />
              </button>
              <Link to="/dashboard" className="flex items-center gap-2">
                <Logo className="h-8 w-auto" />
                <span className="font-bold text-lg tracking-tight">LevelUp<span className="text-primary">.AI</span></span>
              </Link>
            </div>

            {/* Breadcrumbs / Page Title Placeholder (Desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-foreground/40">App</span>
              <span className="text-foreground/40">/</span>
              <span className="text-foreground font-semibold px-2 py-0.5 bg-secondary rounded-md capitalize">
                {navItems.find(i => i.to === location.pathname)?.label || 'Dashboard'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 md:gap-4 ml-auto">
              <div className="relative hidden sm:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="h-10 w-48 md:w-64 rounded-full border border-input bg-secondary/50 focus:bg-background pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                  onKeyDown={handleSearch}
                />
              </div>

              <button className="relative p-2.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-all active:scale-95">
                <span className="absolute top-2.5 right-3 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
              </button>

              <div className="hidden lg:flex items-center gap-3 pl-2 border-l border-border/50">
                <div className="text-right hidden xl:block">
                  <div className="text-sm font-bold leading-none">{user?.name?.split(' ')[0]}</div>
                  <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Pro Member</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 ring-2 ring-background shadow-lg flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.[0] || "U"}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Content Wrapper */}
        <main className={cn("flex-1 overflow-y-auto overflow-x-hidden scroll-smooth", !hideNav && "pb-[80px] lg:pb-0")}>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav (Standard Pattern) */}
        {!hideNav && (
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-card/95 backdrop-blur-xl border-t border-border/50 flex justify-between items-center px-6 z-40 safe-area-bottom shadow-[0_-5px_25px_rgba(0,0,0,0.03)]">
            {navItems.slice(0, 5).map(item => <NavItem key={item.to} mobile {...item} />)}
          </nav>
        )}

        {/* Mobile Drawer Overlay & Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden isolate">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={closeMobileMenu}
            />

            {/* Drawer */}
            <div className="absolute top-0 bottom-0 left-0 w-[280px] bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Logo className="h-8 w-auto" />
                  <span className="font-bold text-lg">LevelUp</span>
                </div>
                <button onClick={closeMobileMenu} className="p-2 -mr-2 text-muted-foreground hover:text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>

              <div className="p-4 space-y-1 overflow-y-auto flex-1">
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Menu</div>
                {navItems.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all",
                      location.pathname === item.to ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="p-4 border-t border-border/50 bg-secondary/30">
                <button
                  onClick={() => { signOut(); closeMobileMenu(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 text-destructive hover:bg-destructive/10 rounded-xl transition-all font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};