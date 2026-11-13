import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Users, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Login: React.FC = () => {
  const { user, login, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ground-light flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Decorative subtle background accents for desktop */}
      <div className="hidden md:block absolute -top-40 -right-40 w-96 h-96 bg-teal/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden md:block absolute -bottom-40 -left-40 w-96 h-96 bg-slate/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal text-white shadow-md mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">
            <span className="text-teal">flat</span>
            <span className="text-ink-light">mates</span>
          </h1>
          <p className="text-sm text-ink-muted">Track shared expenses and balances, effortlessly.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-ink-light">Sign in to your flat</h2>
            <KeyRound className="w-4 h-4 text-ink-muted" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />

            {error && (
              <div className="text-sm text-danger bg-danger/5 border border-danger/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
              Sign In
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill Helper */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-teal" /> Quick Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('admin@flatmates.local', 'AdminTemporaryPassword123!')}
                className="px-3 py-2 text-left bg-gray-50 hover:bg-teal/5 hover:border-teal/30 border border-gray-200 rounded-xl transition-all"
              >
                <p className="text-xs font-bold text-ink-light">Admin</p>
                <p className="text-[10px] text-ink-muted truncate">admin@flatmates.local</p>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('alex@flatmates.local', 'DemoPassword123!')}
                className="px-3 py-2 text-left bg-gray-50 hover:bg-teal/5 hover:border-teal/30 border border-gray-200 rounded-xl transition-all"
              >
                <p className="text-xs font-bold text-ink-light">Demo Flatmate</p>
                <p className="text-[10px] text-ink-muted truncate">alex@flatmates.local</p>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">
          Contact your flatmate admin if you need an account.
        </p>
      </div>
    </div>
  );
};
