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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient emerald glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md">
        {/* Studio Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <span className="font-extrabold text-white text-2xl tracking-tighter">VS</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">VS Studio Admin</h1>
          <p className="mt-1 text-sm text-slate-500">
            Internal Operations System &bull; Founders Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl">
          {!isSupabaseConfigured && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900">
                <p className="font-bold text-emerald-950">Supabase Setup Notice</p>
                <p className="mt-0.5 text-slate-600">
                  Update <code className="text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded font-mono">.env</code> with your project URL & Anon Key. You can use the instant founder test mode below to explore the dashboard right away.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 p-3.5 flex items-start gap-2.5 text-xs text-rose-700 animate-fade-in">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Founder Email"
              type="email"
              placeholder="sriram@vsstudio.com"
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
                className="w-full py-2.5 font-bold text-sm shadow-md shadow-emerald-600/20"
                isLoading={isLoading}
              >
                Sign In to Dashboard
              </Button>
            </div>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider mb-3">
              Instant Founder Demo Access
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoSignIn('Founder 1 (Web/AI)')}
                className="text-xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                Founder 1 (Web/AI)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleDemoSignIn('Founder 2 (Brand)')}
                className="text-xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                Founder 2 (Brand)
              </Button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Protected with Row Level Security & Founder Whitelist</span>
        </div>
      </div>
    </div>
  );
};
