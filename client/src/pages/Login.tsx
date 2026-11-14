import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Users, KeyRound } from 'lucide-react';
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
      const msg = err?.message || err?.response?.data?.message || 'Invalid email or password.';
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

          {/* Account credentials info box */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-ink-light mb-1">Flatmate Accounts (Password: Password123!)</p>
            <p className="text-[11px] text-ink-muted">
              Rauf (Admin), Taz, Mamun, Milon, Miraj, Arefin (@flatmates.local)
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-ink-muted mt-6">
          Contact your flatmate admin if you need an account.
        </p>
      </div>
    </div>
  );
};
