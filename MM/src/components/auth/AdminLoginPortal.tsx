import React, { useState } from 'react';
import { Lock, Mail, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Chrome } from 'lucide-react';
import { signInAdminWithGoogle, ADMIN_EMAIL } from '../../firebase';

interface AdminLoginPortalProps {
  onLoginSuccess: () => void;
  onCancelToPublic: () => void;
}

export const AdminLoginPortal: React.FC<AdminLoginPortalProps> = ({
  onLoginSuccess,
  onCancelToPublic,
}) => {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const user = await signInAdminWithGoogle();
      setIsSuccess(true);
      try {
        sessionStorage.setItem('vsp_admin_auth', 'authenticated');
        localStorage.setItem('vsp_admin_auth', 'authenticated');
        localStorage.setItem('vsp_admin_user', user.email || ADMIN_EMAIL);
      } catch (storageErr) {
        console.warn('Storage warning:', storageErr);
      }
      setTimeout(() => {
        setIsGoogleLoading(false);
        onLoginSuccess();
      }, 400);
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('La fenêtre de connexion Google a été fermée avant la validation.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Le navigateur a bloqué la fenêtre Google. Autorisez les pop-ups ou utilisez la connexion par identifiants ci-dessous.');
      } else {
        setError(err?.message || 'Erreur lors de la connexion Google.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === ADMIN_EMAIL && cleanPassword === 'Panneliste3@') {
      setIsLoading(true);
      setIsSuccess(true);
      try {
        sessionStorage.setItem('vsp_admin_auth', 'authenticated');
        localStorage.setItem('vsp_admin_auth', 'authenticated');
        localStorage.setItem('vsp_admin_user', cleanEmail);
      } catch (storageErr) {
        console.warn('Storage warning:', storageErr);
      }

      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
      }, 500);
    } else {
      setError('Identifiants administrateur invalides. Veuillez vérifier votre adresse e-mail et votre mot de passe.');
    }
  };

  return (
    <div
      id="secret-admin-portal"
      className="fixed inset-0 z-[9999999] w-screen h-screen min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto antialiased select-none"
    >
      {/* Top Header Bar */}
      <header className="w-full py-4 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-black tracking-wider text-white uppercase block">JEAN AUTO VSP</span>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase block">Portail Privé d'Administration</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancelToPublic}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au site public</span>
        </button>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-600/30 mb-3">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Connexion Direction & Gestion
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Accès réservé exclusivement à l'administrateur de la concession
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-xl flex items-start gap-2.5 text-xs text-red-200 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-200 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>Authentification réussie. Ouverture de votre tableau de bord...</div>
            </div>
          )}

          {/* Primary Google Sign-In for Cloud Firestore synchronization */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-bold text-sm rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60 mb-5"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                <span>Connexion Google en cours...</span>
              </>
            ) : (
              <>
                <Chrome className="w-4 h-4 text-blue-600" />
                <span>Se connecter avec Google (Cloud Firestore)</span>
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold">
                Ou accès par mot de passe
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Adresse e-mail administrateur</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
                className="w-full pl-3.5 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-white placeholder:text-slate-500 outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Mot de passe</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-11 py-2.5 bg-slate-950/80 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-white placeholder:text-slate-500 outline-hidden transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-1"
                  tabIndex={-1}
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Accéder au panneau d'administration</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-500">
              Système d'accès sécurisé · Session privée JEAN AUTO VSP
            </span>
          </div>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-slate-600 border-t border-slate-900">
        Portail de gestion interne réservé à la direction · Accès via URL privée
      </footer>
    </div>
  );
};
