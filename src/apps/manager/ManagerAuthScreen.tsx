import React, { useState } from 'react';
import { useNexiaStore } from '../../store/useNexiaStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageSwitcher } from '../../components/layout/LanguageSwitcher';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { ShieldCheck, User, Envelope, Lock, Key, Buildings, SignIn, UserPlus, WarningCircle, CheckCircle, ArrowRight } from '@phosphor-icons/react';

interface ManagerAuthScreenProps {
  standalone?: boolean;
}

type AuthMode = 'login' | 'signup';

export const ManagerAuthScreen: React.FC<ManagerAuthScreenProps> = () => {
  const { registerManager, loginManager } = useNexiaStore();
  const { t, isRtl } = useLanguageStore();

  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Sign In State
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmailOrPhone, setSignupEmailOrPhone] = useState('');
  const [signupAgency, setSignupAgency] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Status & Feedback
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Login Submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!loginEmailOrPhone.trim() || !loginPassword.trim()) {
      setError(t.manager_auth.error_empty_fields);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginManager(loginEmailOrPhone, loginPassword);
      if (!res.success) {
        setError(res.message || t.manager_auth.error_invalid_credentials);
      }
    } catch {
      setError(t.manager_auth.error_invalid_credentials);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!signupName.trim() || !signupEmailOrPhone.trim() || !signupPassword.trim()) {
      setError(t.manager_auth.error_empty_fields);
      return;
    }

    if (signupPassword.length < 6) {
      setError(t.manager_auth.error_password_short);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError(t.manager_auth.error_password_match);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerManager({
        name: signupName,
        emailOrPhone: signupEmailOrPhone,
        password: signupPassword,
        agencyName: signupAgency
      });

      if (!res.success) {
        setError(res.message || t.manager_auth.error_account_exists);
      } else {
        setSuccessMessage(t.manager_auth.success_registered);
      }
    } catch {
      setError(t.manager_auth.error_account_exists);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-elevate-bg dark:bg-elevate-bg-dark text-slate-900 dark:text-slate-100 flex transition-colors duration-300 font-sans">
      
      {/* LEFT PANE - Desktop Only Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-900 items-center justify-center">
        {/* Abstract animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-800 to-brand-950"></div>
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-600/20 blur-[100px] animate-pulse"></div>
        <div className="absolute top-[40%] right-[10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[80px]"></div>
        
        <div className="relative z-10 p-12 text-center max-w-xl">
          <img src="/assets/logo.png" alt="NEXIA Solution Logo" className="w-64 h-auto object-contain mx-auto mb-8 drop-shadow-xl invert brightness-0" />
          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight">
            Manage your properties with unprecedented clarity.
          </h2>
          <p className="text-brand-100/80 text-lg leading-relaxed">
            The all-in-one residential management suite designed for modern property managers and security teams.
          </p>
        </div>
      </div>

      {/* RIGHT PANE - Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12 relative">
        
        {/* Top Bar with Language & Theme Controls */}
        <div className="absolute top-4 lg:top-8 left-4 lg:left-8 right-4 lg:right-8 flex items-center justify-between z-20">
          <div className="lg:hidden flex items-center gap-2">
            <img src="/assets/logo.png" alt="NEXIA Solution Logo" className="w-32 h-auto object-contain" />
          </div>
          <div className="hidden lg:block"></div> {/* Spacer for desktop */}
          <div className="flex items-center gap-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <ThemeToggle />
            <LanguageSwitcher compact />
          </div>
        </div>

        {/* Main Authentication Card */}
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-slate-900/10 dark:shadow-black/20 transition-all mt-12 lg:mt-0">
          
          {/* Header Badge & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 text-xs font-bold mb-4">
              <ShieldCheck weight="duotone" className="w-3.5 h-3.5" />
              <span>{t.manager_auth.badge}</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">
              {authMode === 'login' ? t.manager_auth.login_title : t.manager_auth.signup_title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
              {authMode === 'login' ? t.manager_auth.login_subtitle : t.manager_auth.signup_subtitle}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900/50 rounded-2xl mb-8 border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <SignIn weight="duotone" className="w-4 h-4" />
              <span>{t.manager_auth.tab_login}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm border border-slate-200/50 dark:border-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <UserPlus weight="duotone" className="w-4 h-4" />
              <span>{t.manager_auth.tab_signup}</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-300 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <WarningCircle weight="duotone" className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-brand-50 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/50 text-brand-800 dark:text-brand-300 text-sm flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle weight="duotone" className="w-5 h-5 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t.manager_auth.email_phone_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Envelope weight="duotone" className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={loginEmailOrPhone}
                    onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                    placeholder={t.manager_auth.email_phone_placeholder}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl ps-11 pe-4 py-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {t.manager_auth.password_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock weight="duotone" className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t.manager_auth.password_placeholder}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl ps-11 pe-4 py-3.5 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-4 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? t.common.loading : t.manager_auth.login_btn}</span>
                <ArrowRight weight="duotone" className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setError(null);
                  }}
                  className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors"
                >
                  {t.manager_auth.switch_to_signup}
                </button>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.manager_auth.name_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User weight="duotone" className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder={t.manager_auth.name_placeholder}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl ps-11 pe-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.manager_auth.email_phone_label} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Envelope weight="duotone" className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={signupEmailOrPhone}
                    onChange={(e) => setSignupEmailOrPhone(e.target.value)}
                    placeholder={t.manager_auth.email_phone_placeholder}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl ps-11 pe-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.manager_auth.agency_label} <span className="text-slate-400 font-normal">({t.common.optional})</span>
                </label>
                <div className="relative">
                  <Buildings weight="duotone" className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={signupAgency}
                    onChange={(e) => setSignupAgency(e.target.value)}
                    placeholder={t.manager_auth.agency_placeholder}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl ps-11 pe-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.manager_auth.password_label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock weight="duotone" className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl ps-11 pe-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.manager_auth.password_confirm_label} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Key weight="duotone" className="w-5 h-5 text-slate-400 absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl ps-11 pe-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-brand-500 dark:focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-4 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{isSubmitting ? t.common.loading : t.manager_auth.signup_btn}</span>
                <ArrowRight weight="duotone" className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError(null);
                  }}
                  className="text-sm font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline transition-colors"
                >
                  {t.manager_auth.switch_to_login}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Branding */}
        <p className="absolute bottom-6 left-0 right-0 text-[12px] text-slate-400 dark:text-slate-500 text-center font-medium">
          {t.app.footer_copyright} • Haven Residential Suite
        </p>

      </div>
    </div>
  );
};
