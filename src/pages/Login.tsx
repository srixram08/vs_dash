import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Lock, Mail, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, enableDemoMode, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  // If already logged in, redirect immediately
  React.useEffect(() => {
    if (isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAdmin, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both your founder email and password.');
      return;
    }

    setIsLoading(true);
    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      navigate(from, { replace: true });
    }
  };

  const handleDemoSignIn = (founderName: string) => {
    enableDemoMode(founderName);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-primary-600/20 via-cyan-500/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        {/* Studio Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 items-center justify-center shadow-glow-sm mb-4">
            <span className="font-extrabold text-white text-2xl tracking-tighter">VS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">VS Studio Admin</h1>
          <p className="mt-1 text-sm text-slate-400">
            Internal Operations System &bull; Founders Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-800 bg-[#0c1220]/90 p-7 shadow-2xl backdrop-blur-xl">
          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3.5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-300">
                <p className="font-semibold text-amber-200">Supabase Setup Notice</p>
                <p className="mt-0.5 text-slate-300">
                  Update <code className="text-amber-300 bg-amber-950/40 px-1 py-0.5 rounded">.env</code> with your project URL & Anon Key. You can use the instant founder test mode below to explore the full dashboard right now.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Founder Email"
              type="email"
              placeholder="sanjay@vsstudio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="gradient"
                className="w-full py-2.5 font-semibold text-sm"
                isLoading={isLoading}
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Quick Demo Access Buttons for Development Testing */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <p className="text-[11px] font-medium text-slate-400 text-center uppercase tracking-wider mb-3">
              Instant Founder Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoSignIn('Founder 1 (Web/AI)')}
                className="text-xs"
              >
                Founder 1 (Web/AI)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoSignIn('Founder 2 (Branding)')}
                className="text-xs"
              >
                Founder 2 (Brand)
              </Button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
          <span>Protected with Row Level Security & Founder Whitelist</span>
        </div>
      </div>
    </div>
  );
};
