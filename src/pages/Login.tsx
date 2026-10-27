import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { VSLogo } from '../components/ui/VSLogo';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Interactive Character States (WeStud Micro-Interactions)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [bouncedCharacter, setBouncedCharacter] = useState<string | null>(null);

  // Dynamic eye tracking coordinates
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { signIn, enableDemoMode, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  useEffect(() => {
    if (isAdmin) {
      navigate(from, { replace: true });
    }
  }, [isAdmin, navigate, from]);

  // Periodic natural blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 170);
    }, 3600);
    return () => clearInterval(blinkInterval);
  }, []);

  // Global mousemove eye tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isPasswordFocused) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width * 0.28;
    const centerY = rect.top + rect.height * 0.55;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(Math.hypot(deltaX, deltaY), 350);
    const maxOffset = 5.5; // pixel pupil movement range

    const normalizedDistance = distance / 350;
    const offsetX = Math.cos(angle) * maxOffset * normalizedDistance;
    const offsetY = Math.sin(angle) * maxOffset * normalizedDistance;

    setPupilOffset({ x: offsetX, y: offsetY });
  };

  const triggerBounce = (characterId: string) => {
    setBouncedCharacter(characterId);
    setTimeout(() => setBouncedCharacter(null), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter your founder credentials.');
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

  const handleFounderQuickLogin = (founder: 'VISHNU' | 'SRIRAM') => {
    if (founder === 'VISHNU') {
      enableDemoMode('VISHNU VARDHAN R G');
    } else {
      enableDemoMode('SRIRAM S');
    }
    navigate('/', { replace: true });
  };

  // Pupil offset calculation (looks right toward form inputs when focused)
  const computedPupilX = isEmailFocused ? 5 : pupilOffset.x;
  const computedPupilY = isEmailFocused ? 1 : pupilOffset.y;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen w-full flex flex-col md:flex-row bg-[#eaebed] font-sans selection:bg-slate-800 selection:text-white"
    >
      {/* ========================================================= */}
      {/* LEFT HALF (FULL SCREEN): Animated Living Characters Canvas*/}
      {/* ========================================================= */}
      <div className="w-full md:w-1/2 lg:w-[54%] min-h-[460px] md:min-h-screen bg-[#eaebed] flex flex-col justify-between p-8 sm:p-12 lg:p-16 relative select-none overflow-hidden">
        {/* Top Minimal Studio Watermark */}
        <div className="flex items-center gap-2.5 z-20">
          <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center shadow-xs">
            <VSLogo className="w-5 h-5 text-white" size={20} color="#ffffff" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 tracking-tight">VS STUDIO</p>
            <p className="text-[10px] text-slate-500 font-medium">Founders Portal</p>
          </div>
        </div>

        {/* Scaled-up Interactive Living Characters Group */}
        <div className="relative flex items-end justify-center w-full max-w-[420px] mx-auto my-auto pt-16 pb-8 md:pb-12">
          {/* -------------------------------------------------- */}
          {/* 1. TALL PURPLE CHARACTER (Back Center)             */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => triggerBounce('purple')}
            className={`absolute left-[105px] bottom-0 w-[105px] h-[305px] bg-[#6828fe] rounded-t-xl z-0 flex flex-col items-center pt-10 shadow-md cursor-pointer transition-all duration-300 animate-purple-float ${
              bouncedCharacter === 'purple' ? 'scale-105 -translate-y-3' : ''
            }`}
          >
            {/* Eyes & Hand Covering Animation (Signature WeStud Feature!) */}
            <div className="relative flex items-center justify-center">
              {/* Eyes */}
              <div className="flex items-center gap-3.5">
                {/* Left Eye */}
                <div className="w-5 h-5 bg-white rounded-full relative shadow-xs overflow-hidden flex items-center justify-center">
                  {isBlinking || (isPasswordFocused && !showPassword) ? (
                    <div className="w-4 h-[2.5px] bg-[#1e232a] rounded-full" />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 bg-[#1e232a] rounded-full absolute transition-transform duration-100"
                      style={{
                        transform: `translate(${computedPupilX}px, ${computedPupilY}px)`,
                      }}
                    />
                  )}
                </div>

                {/* Right Eye */}
                <div className="w-5 h-5 bg-white rounded-full relative shadow-xs overflow-hidden flex items-center justify-center">
                  {isBlinking || (isPasswordFocused && !showPassword) ? (
                    <div className="w-4 h-[2.5px] bg-[#1e232a] rounded-full" />
                  ) : (
                    <div
                      className="w-2.5 h-2.5 bg-[#1e232a] rounded-full absolute transition-transform duration-100"
                      style={{
                        transform: `translate(${computedPupilX}px, ${computedPupilY}px)`,
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Hands covering eyes when typing password! */}
              <div
                className={`absolute -top-1 w-16 flex items-center justify-between transition-all duration-300 pointer-events-none ${
                  isPasswordFocused && !showPassword
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-10 opacity-0 scale-75'
                }`}
              >
                <div className="w-5 h-5 bg-[#521bdf] rounded-full border-2 border-white/90 shadow-sm" />
                <div className="w-5 h-5 bg-[#521bdf] rounded-full border-2 border-white/90 shadow-sm" />
              </div>
            </div>

            {/* Mouth with dynamic expressions */}
            <div className="mt-4 transition-all duration-200">
              {isPasswordFocused && !showPassword ? (
                /* Surprised / Shy "O" Mouth */
                <div className="w-3 h-3 rounded-full border-2 border-[#1e232a]" />
              ) : isEmailFocused ? (
                /* Curious Focused Mouth */
                <div className="w-4 h-1 bg-[#1e232a] rounded-full" />
              ) : (
                /* Cute Smile */
                <div className="w-4 h-2 border-b-2 border-[#1e232a] rounded-full" />
              )}
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* 2. BLACK RECTANGULAR TOWER (Middle Right)          */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => triggerBounce('black')}
            className={`absolute left-[180px] bottom-0 w-[68px] h-[195px] bg-[#1e232a] rounded-t-sm z-10 flex flex-col items-center pt-6 shadow-md cursor-pointer transition-all duration-300 animate-black-bob ${
              bouncedCharacter === 'black' ? 'scale-105 -translate-y-3' : ''
            } ${isPasswordFocused && !showPassword ? 'rotate-2 translate-x-1.5' : ''}`}
          >
            {/* Eyes looking sideways */}
            <div className="flex items-center gap-2 self-start pl-2.5">
              <div className="w-4 h-4 bg-white rounded-full relative overflow-hidden flex items-center justify-center shadow-2xs">
                {isBlinking ? (
                  <div className="w-3 h-[2px] bg-[#1e232a]" />
                ) : (
                  <div
                    className="w-2.5 h-2.5 bg-[#1e232a] rounded-full absolute transition-transform duration-100"
                    style={{
                      transform:
                        isPasswordFocused && !showPassword
                          ? 'translate(2.5px, 0)'
                          : `translate(${Math.max(computedPupilX - 2, -3)}px, ${computedPupilY}px)`,
                    }}
                  />
                )}
              </div>
              <div className="w-4 h-4 bg-white rounded-full relative overflow-hidden flex items-center justify-center shadow-2xs">
                {isBlinking ? (
                  <div className="w-3 h-[2px] bg-[#1e232a]" />
                ) : (
                  <div
                    className="w-2.5 h-2.5 bg-[#1e232a] rounded-full absolute transition-transform duration-100"
                    style={{
                      transform:
                        isPasswordFocused && !showPassword
                          ? 'translate(2.5px, 0)'
                          : `translate(${Math.max(computedPupilX - 2, -3)}px, ${computedPupilY}px)`,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* -------------------------------------------------- */}
          {/* 3. ORANGE SEMI-CIRCLE CHARACTER (Front Left)       */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => triggerBounce('orange')}
            className={`relative w-[185px] h-[102px] bg-[#ff7834] rounded-t-full z-20 flex flex-col items-center justify-center pt-2 shadow-md cursor-pointer transition-all duration-300 animate-orange-wobble ${
              bouncedCharacter === 'orange' ? 'scale-105 -translate-y-3' : ''
            }`}
          >
            {/* Eyes */}
            <div className="flex items-center gap-5 mb-1.5">
              {isBlinking || (isPasswordFocused && !showPassword) ? (
                <>
                  <div className="w-3.5 h-2 border-b-2 border-[#1e232a] rounded-full" />
                  <div className="w-3.5 h-2 border-b-2 border-[#1e232a] rounded-full" />
                </>
              ) : (
                <>
                  <div
                    className="w-2.5 h-2.5 bg-[#1e232a] rounded-full transition-transform duration-100"
                    style={{
                      transform: `translate(${computedPupilX * 0.6}px, ${computedPupilY * 0.6}px)`,
                    }}
                  />
                  <div
                    className="w-2.5 h-2.5 bg-[#1e232a] rounded-full transition-transform duration-100"
                    style={{
                      transform: `translate(${computedPupilX * 0.6}px, ${computedPupilY * 0.6}px)`,
                    }}
                  />
                </>
              )}
            </div>
            {/* Cute Smiling Mouth */}
            <div className="w-4 h-2.5 border-b-2 border-[#1e232a] rounded-full" />
          </div>

          {/* -------------------------------------------------- */}
          {/* 4. YELLOW ARCH CHARACTER (Front Right)             */}
          {/* -------------------------------------------------- */}
          <div
            onClick={() => triggerBounce('yellow')}
            className={`relative -ml-5 w-[75px] h-[145px] bg-[#f2b705] rounded-t-full z-20 flex flex-col items-start pt-8 pl-4 shadow-md cursor-pointer transition-all duration-300 animate-yellow-float ${
              bouncedCharacter === 'yellow' ? 'scale-105 -translate-y-3' : ''
            }`}
          >
            {/* Eye looking left */}
            <div className="w-2.5 h-2.5 bg-[#1e232a] rounded-full mb-3" />
            {/* Horizontal Line Mouth */}
            <div className="w-9 h-[3px] bg-[#1e232a] rounded-full" />
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="text-center md:text-left z-20 text-[11px] text-slate-400 font-medium">
          &copy; {new Date().getFullYear()} VS Studio. All systems operational.
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT HALF (FULL SCREEN): Minimalist Modern Login Column  */}
      {/* ========================================================= */}
      <div className="w-full md:w-1/2 lg:w-[46%] min-h-screen bg-white flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-12 relative z-10 border-t md:border-t-0 md:border-l border-slate-200/60 shadow-xl md:shadow-none">
        <div className="w-full max-w-md mx-auto space-y-7">
          {/* Official Studio Logo */}
          <div className="flex justify-center mb-2">
            <VSLogo className="w-14 h-12 text-slate-950" size={54} color="#0f172a" />
          </div>

          {/* Heading */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Please enter your details
            </p>
          </div>

          {/* Error Message if any */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 animate-fade-in text-center font-medium">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={() => setIsEmailFocused(false)}
                placeholder="founder@vsstudio.com"
                required
                autoComplete="email"
                className="w-full border-b border-slate-300 focus:border-slate-900 py-2.5 text-xs text-slate-900 outline-none transition-colors bg-transparent placeholder-slate-400 font-medium"
              />
            </div>

            {/* Password Input with Show/Hide Eye */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full border-b border-slate-300 focus:border-slate-900 py-2.5 pr-9 text-xs text-slate-900 outline-none transition-colors bg-transparent placeholder-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 text-slate-400 hover:text-slate-700 transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember for 30 days & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-0 cursor-pointer accent-slate-900"
                />
                <span>Remember for 30 days</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  alert(
                    'Please verify your credentials or use the instant founder demo buttons below.'
                  )
                }
                className="text-slate-400 hover:text-slate-800 transition font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {/* Primary Log In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#1e232a] hover:bg-black text-white text-xs font-bold transition shadow-sm active:scale-[0.99] flex items-center justify-center"
              >
                {isLoading ? 'Signing in...' : 'Log In'}
              </button>

              {/* Secondary Log in with Google Button */}
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('VISHNU')}
                className="w-full py-3 rounded-full bg-[#f1f3f5] hover:bg-[#e8eaed] text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-2.5 active:scale-[0.99]"
              >
                {/* Official Google SVG G */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25A11.97 11.97 0 000 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Log in with Google</span>
              </button>
            </div>
          </form>

          {/* Quick Founder Switcher & Footer */}
          <div className="pt-6 border-t border-slate-100 text-center space-y-3.5">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                Founders Only:
              </span>
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('VISHNU')}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition shadow-2xs"
              >
                VISHNU VARDHAN R G
              </button>
              <button
                type="button"
                onClick={() => handleFounderQuickLogin('SRIRAM')}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition shadow-2xs"
              >
                SRIRAM S
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Don&apos;t have an account?{' '}
              <button
                onClick={() =>
                  alert(
                    'Access is restricted exclusively to VS Studio founders: VISHNU VARDHAN R G and SRIRAM S.'
                  )
                }
                className="font-semibold text-slate-900 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
