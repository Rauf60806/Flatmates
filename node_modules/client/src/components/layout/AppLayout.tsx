import React from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Plus, Users, BarChart2, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials, getAvatarColor } from '../../utils/format';
import { ThemeToggle } from '../ui/ThemeToggle';

interface NavItem {
  to: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  exact?: boolean;
  isAction?: boolean;
  adminOnly?: boolean;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
  { to: '/', icon: Home, label: 'Home', exact: true },
  { to: '/add', icon: Plus, label: 'Add', exact: false, isAction: true },
  { to: '/flatmates', icon: Users, label: 'Flatmates', exact: false },
  { to: '/stats', icon: BarChart2, label: 'Stats', exact: false },
];

export const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const initials = getInitials(user.name);
  const avatarBg = getAvatarColor(user.name);
  const isAdmin = user.role === 'admin';

  const DESKTOP_NAV_ITEMS: NavItem[] = [
    { to: '/', icon: Home, label: 'Home', exact: true },
    { to: '/flatmates', icon: Users, label: 'Flatmates', exact: false },
    { to: '/stats', icon: BarChart2, label: 'Stats', exact: false },
    ...(isAdmin ? [{ to: '/admin', icon: Shield, label: 'Admin', exact: false }] : []),
  ];

  return (
    <div className="min-h-screen bg-ground-light dark:bg-ground-dark transition-colors duration-200 flex flex-col text-ink-light dark:text-ink-dark">
      {/* Desktop Header (Sticky Top Navbar) */}
      <header className="hidden md:block sticky top-0 z-40 bg-white/80 dark:bg-ground-surface-dark/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-teal flex items-center justify-center shadow-sm group-hover:bg-teal-hover transition-colors">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-teal">
                flat<span className="text-ink-light dark:text-ink-dark">mates</span>
              </span>
            </NavLink>

            {/* Desktop Nav Links */}
            <nav className="flex items-center gap-1">
              {DESKTOP_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    className="relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2"
                  >
                    <span
                      className={`relative z-10 flex items-center gap-2 ${
                        isActive
                          ? 'text-teal font-bold'
                          : 'text-ink-muted dark:text-ink-muted-dark hover:text-ink-light dark:hover:text-ink-dark'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="desktop-nav-pill"
                        className="absolute inset-0 bg-teal/10 dark:bg-teal/20 rounded-xl"
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Add Expense CTA + Theme Toggle + User Profile + Logout */}
          <div className="flex items-center gap-3">
            <NavLink
              to="/add"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal hover:bg-teal-hover text-white text-sm font-semibold shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span>Add Expense</span>
            </NavLink>

            <ThemeToggle />

            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />

            {/* User Pill */}
            <div className="flex items-center gap-3 pl-1">
              <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center shadow-sm`}>
                <span className="text-white text-xs font-bold">{initials}</span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-ink-light dark:text-ink-dark leading-tight">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-ink-muted dark:text-ink-muted-dark leading-none">{user.email}</span>
                  {isAdmin && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-teal/10 text-teal px-1.5 py-0.5 rounded leading-none">
                      Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              title="Log out"
              aria-label="Log out"
              className="p-2 text-ink-muted dark:text-ink-muted-dark hover:text-danger rounded-xl hover:bg-danger/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-ground-surface-dark/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 h-14 flex items-center justify-between pt-safe transition-colors duration-200">
        <NavLink to="/" className="font-bold text-lg tracking-tight text-teal select-none">
          flat<span className="text-ink-light dark:text-ink-dark">mates</span>
        </NavLink>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {isAdmin && (
            <NavLink
              to="/admin"
              aria-label="Admin panel"
              className="p-2 text-ink-muted dark:text-ink-muted-dark hover:text-teal rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Shield className="w-4 h-4" />
            </NavLink>
          )}
          <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Log out"
            className="p-2 text-ink-muted dark:text-ink-muted-dark hover:text-danger rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Responsive Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto md:px-6 lg:px-8 md:py-8 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* Mobile Fixed Bottom Nav (Hidden on Desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-ground-surface-dark/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 pb-safe transition-colors duration-200">
        <div className="max-w-md mx-auto flex items-stretch h-16">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isAdd = item.isAction;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className="flex-1"
              >
                {({ isActive }) => (
                  <div className={`relative flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
                    isActive ? 'text-teal dark:text-teal-dark' : 'text-ink-muted dark:text-ink-muted-dark'
                  }`}>
                    {isActive && !isAdd && (
                      <motion.div
                        layoutId="mobile-nav-pill"
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-teal rounded-full"
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                      />
                    )}
                    {isAdd ? (
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md -mt-5 transition-colors ${
                          isActive ? 'bg-teal-hover' : 'bg-teal'
                        }`}
                      >
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <>
                        <Icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                      </>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
