import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  UtensilsCrossed, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Globe,
  HelpCircle,
  X
} from 'lucide-react';
import { User, Language } from '../../types';
import { MOCK_USERS } from '../../data/mockData';
import { JBBQLogo } from '../common/JBBQLogo';

interface LoginPortalProps {
  onLoginSuccess: (user: User) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onLoginSuccess,
  language,
  onToggleLanguage,
}) => {
  const isLao = language === 'la';

  const [identifier, setIdentifier] = useState('mrsoukphac@gmail.com');
  const [password, setPassword] = useState('Admin@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim()) {
      setErrorMsg(isLao ? 'ກະລຸນາປ້ອນ ອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້' : 'Please enter your work email or username');
      return;
    }

    if (password.length < 6) {
      setErrorMsg(isLao ? 'ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 8 ຕົວອັກສອນ' : 'Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // Find matching mock user by email or username
      const matched = MOCK_USERS.find(
        u => u.email.toLowerCase() === identifier.toLowerCase() || 
             u.username.toLowerCase() === identifier.toLowerCase()
      );

      setIsLoading(false);

      if (matched) {
        onLoginSuccess(matched);
      } else {
        // Fallback to super admin if demo input
        onLoginSuccess({
          ...MOCK_USERS[0],
          email: identifier.includes('@') ? identifier : `${identifier}@laobuffet.la`,
          username: identifier.split('@')[0]
        });
      }
    }, 400);
  };

  const handleInstantDemoLogin = (user: User) => {
    setIdentifier(user.email);
    setPassword('Pass#2026!');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(user);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background Subtle Ambience / Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Top Bar on Login Page */}
      <div className="absolute top-5 right-6 flex items-center gap-3 z-20">
        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{isLao ? '🇱🇦 ພາສາລາວ' : '🇬🇧 English'}</span>
        </button>
      </div>

      {/* Brand Header with Modern J BBQ Mascot Logo */}
      <div className="text-center mb-6 relative z-10 flex flex-col items-center">
        <JBBQLogo size="xl" showText={false} className="mb-2" />
        <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
          <span>J-BUFFET POS</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            BBQ
          </span>
        </h2>
        <p className="text-[11px] font-bold tracking-widest uppercase text-amber-400 mt-0.5">
          {isLao ? 'ລະບົບພາຍໃນຈັດການຮ້ານບາບີຄິວ & ບຸບເຟ່' : 'MODERN BBQ RESTAURANT OS'}
        </p>
      </div>

      {/* Main Card (Matching Image 1) */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl shadow-black/60 border border-slate-200/80 p-8 sm:p-9 relative z-10">
        
        {/* Title & Subtitle */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 mb-1.5">
            {isLao ? 'ລະບົບເຂົ້າສູ່ລະບົບພະນັກງານ' : 'Partner & Management Portal'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed px-2">
            {isLao 
              ? 'ກະລຸນາປ້ອນຂໍ້ມູນເຂົ້າສູ່ລະບົບເພື່ອຈັດການໂຕະ, ອໍເດີ ແລະ ການຊຳລະເງິນ' 
              : 'Enter your authorized credentials to access buffet operations, live floor plan, and billing.'}
          </p>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          
          {/* Work Email / Username */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {isLao ? 'ອີເມວ ຫຼື ຊື່ຜູ້ໃຊ້' : 'WORK EMAIL ADDRESS'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="admin@demo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              {isLao ? 'ລະຫັດຜ່ານ' : 'PASSWORD'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 focus:ring-offset-0"
              />
              <span>{isLao ? 'ຈົດຈຳການເຂົ້າສູ່ລະບົບ' : 'Remember terminal session'}</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotSuccess(false);
              }}
              className="text-slate-500 hover:text-amber-600 font-medium hover:underline transition"
            >
              {isLao ? 'ລືມລະຫັດຜ່ານ?' : 'Forgot password?'}
            </button>
          </div>

          {/* Submit Button (Matching Image 1) */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-slate-950/20 active:scale-[0.99] transition duration-150 cursor-pointer disabled:opacity-70 mt-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{isLao ? 'ເຂົ້າສູ່ລະບົບ (Sign In to Portal)' : 'Sign In to Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* INSTANT DEMO CREDENTIALS (Exact matching Image 1!) */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="text-center mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isLao ? 'ເຂົ້າໃຊ້ດ່ວນດ້ວຍບັນຊີຕົວຢ່າງ (Instant Demo Credentials)' : 'INSTANT DEMO CREDENTIALS'}
            </span>
          </div>

          <div className="space-y-2">
            {/* Demo Super Admin: Soukphachan */}
            <button
              type="button"
              onClick={() => handleInstantDemoLogin(MOCK_USERS[0])}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200/90 text-left transition flex items-center gap-3 group cursor-pointer"
            >
              <img
                src={MOCK_USERS[0].avatar}
                alt={MOCK_USERS[0].fullName}
                className="w-9 h-9 rounded-xl object-cover border border-amber-500/40 shrink-0"
              />
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-black text-slate-900 truncate">
                  {MOCK_USERS[0].fullName}
                </p>
                <p className="text-[10px] text-amber-600 font-bold truncate">
                  {isLao ? '👑 ເຈົ້າຂອງຮ້ານ / ຜູ້ບໍລິຫານສູງສຸດ (Super Admin)' : '👑 Owner / Super Admin'}
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-amber-500 text-slate-950 rounded-lg shrink-0">
                {isLao ? 'ເຂົ້າສູ່ລະບົບ' : 'Sign In'}
              </span>
            </button>
          </div>

          {/* Quick info note */}
          <div className="mt-4 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {isLao 
                ? 'ລະບົບຄວາມປອດໄພ 8 ຕົວອັກສອນ, ຕົວໃຫຍ່ 1, ຕົວເລກ 1 & ອັກຂະລະພິເສດ 1' 
                : 'Security policy: 8+ chars, 1 uppercase, 1 number & 1 special symbol'}
            </span>
          </div>
        </div>

      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-slate-600 relative z-10">
        <p>Lao Buffet POS Enterprise Architecture &bull; Vientiane &bull; Luang Prabang &bull; Pakse</p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white text-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-200 relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              {isLao ? 'ຕັ້ງຄ່າລະຫັດຜ່ານໃໝ່ (Forgot Password)' : 'Reset Your Password'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {isLao 
                ? 'ປ້ອນອີເມວຂອງທ່ານເພື່ອຮັບລິ້ງຣີເຊັດລະຫັດຜ່ານຜ່ານ Email ຫຼື SMS' 
                : 'Enter your registered email to receive a password reset link via Email/SMS.'}
            </p>

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col items-center text-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                <p className="font-bold">{isLao ? 'ສົ່ງລິ້ງສຳເລັດແລ້ວ!' : 'Reset link sent successfully!'}</p>
                <p className="text-[11px] text-emerald-700">
                  {isLao ? 'ກະລຸນາກວດສອບກ່ອງຈົດໝາຍຂອງທ່ານ.' : 'Please check your inbox or contact the branch manager.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs hover:bg-emerald-700"
                >
                  {isLao ? 'ປິດ' : 'Close'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@demo.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setForgotSuccess(true)}
                  className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  {isLao ? 'ສົ່ງລິ້ງຣີເຊັດລະຫັດຜ່ານ' : 'Send Reset Link'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
