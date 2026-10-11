import React, { useState } from 'react';
import {
  Wallet,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

export const AuthView: React.FC = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setError(null);
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please enter a username.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      if (trimmedUsername.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        setError('Username can only contain letters, numbers, and underscores.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify and re-enter.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await login({
          username: trimmedUsername,
          password,
        });
      } else {
        await register({
          username: trimmedUsername,
          password,
          confirmPassword,
          displayName: displayName.trim() || undefined,
        });
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const isNotFoundOrInvalid =
        err?.status === 401 ||
        err?.message?.toLowerCase().includes('invalid username or password') ||
        err?.message?.toLowerCase().includes('not found');

      if (mode === 'login' && isNotFoundOrInvalid) {
        setError(
          'Invalid username or password. If you have not created an account yet, please click "Create Account" above to register.'
        );
      } else {
        setError(
          err?.message ||
            (mode === 'login'
              ? 'Unable to log in. Please check your credentials or create an account.'
              : 'Unable to register. Username might already be in use.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-main)] flex flex-col justify-center items-center p-4 sm:p-6 transition-colors duration-200">
      {/* Decorative background aura */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-lg mb-3">
            <Wallet className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-ink)] tracking-tight">
            DailyFlow
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-medium">
            Smart Personal Finance & Daily Expense Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="relative rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-6 sm:p-8 backdrop-blur-md">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-[var(--surface-subtle)] p-1 mb-6 border border-[var(--border)]">
            <button
              type="button"
              onClick={() => resetForm('login')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-[var(--surface)] text-[var(--text-ink)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => resetForm('register')}
              className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-[var(--surface)] text-[var(--text-ink)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-ink)]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[var(--text-ink)]">
              {mode === 'login' ? 'Welcome back' : 'Start your financial journey'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {mode === 'login'
                ? 'Sign in to access your independent financial records.'
                : 'Your balance will start fresh with zero shared data.'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              role="alert"
              className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="auth-username"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
              >
                Username
              </label>
              <div className="relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
                <div className="pl-3.5 pr-2 text-[var(--text-muted)]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="auth-username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. samiul"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-3.5 py-2.5 bg-transparent text-sm text-[var(--text-ink)] placeholder-[var(--text-muted)]/50 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Optional Display Name on Register */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-display-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                >
                  Display Name <span className="text-[10px] font-normal normal-case">(optional)</span>
                </label>
                <div className="relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
                  <div className="pl-3.5 pr-2 text-[var(--text-muted)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-display-name"
                    type="text"
                    placeholder="e.g. Samiul Islam"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pr-3.5 py-2.5 bg-transparent text-sm text-[var(--text-ink)] placeholder-[var(--text-muted)]/50 focus:outline-none font-medium"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label
                htmlFor="auth-password"
                className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
                <div className="pl-3.5 pr-2 text-[var(--text-muted)]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-10 py-2.5 bg-transparent text-sm text-[var(--text-ink)] placeholder-[var(--text-muted)]/50 focus:outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 p-1 text-[var(--text-muted)] hover:text-[var(--text-ink)] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password on Register */}
            {mode === 'register' && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
                  <div className="pl-3.5 pr-2 text-[var(--text-muted)]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    placeholder="Re-type your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pr-10 py-2.5 bg-transparent text-sm text-[var(--text-ink)] placeholder-[var(--text-muted)]/50 focus:outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 p-1 text-[var(--text-muted)] hover:text-[var(--text-ink)] transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create My Account'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Privacy & Isolation Highlight */}
          <div className="mt-6 pt-5 border-t border-[var(--border)] text-center">
            <div className="inline-flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Isolated multi-user encryption • Independent financial data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
