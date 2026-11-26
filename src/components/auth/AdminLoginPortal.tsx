import React, { useState } from 'react';
import { Lock, Mail, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { signInWithSharedCredentials, SHARED_ADMIN_EMAIL } from '../../firebase';

interface AdminLoginPortalProps {
  onLoginSuccess: () => void;
  onCancelToPublic: () => void;
}

export const AdminLoginPortal: React.FC<AdminLoginPortalProps> = ({
  onLoginSuccess,
  onCancelToPublic,
}) => {
  const [email, setEmail] = useState(SHARED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const persistAdminSession = (userEmail: string) => {
    try {
      sessionStorage.setItem('vsp_admin_auth', 'authenticated');
      localStorage.setItem('vsp_admin_auth', 'authenticated');
      localStorage.setItem('vsp_admin_user', userEmail);
    } catch (storageErr) {
      console.warn('Storage warning:', storageErr);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword.trim()) {
      setError('Veuillez saisir votre adresse e-mail et votre mot de passe.');
      return;
    }

    setIsLoading(true);
    const authRes = await signInWithSharedCredentials(cleanEmail, cleanPassword);
    setIsLoading(false);

    if (authRes.firebaseAuthenticated) {
      setIsSuccess(true);
      persistAdminSession(authRes.user?.email || cleanEmail);
      setTimeout(() => {
        onLoginSuccess();
      }, 250);
    } else {
      setError(authRes.errorMessage || 'Identifiants invalides. Vérifiez votre e-mail et votre mot de passe.');
    }
  };

  return (
    <div
      id="secret-admin-portal"
      className="fixed inset-0 z-[9999999] w-screen h-screen min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between overflow-y-auto antialiased select-none"
    >
      {/* Top Header Bar */}
      <header className="w-full py-4 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-wider text-white uppercase block">JEAN AUTO VSP</span>
            <span className="text-[11px] text-slate-400 block">Accès Administration</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancelToPublic}
          className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour au site</span>
        </button>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-600 flex items-center justify-center text-white mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Connexion Administration
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Accès unique et partagé · Synchronisation Cloud en temps réel
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg flex items-center gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>Connexion réussie. Ouverture du backoffice...</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Adresse e-mail</span>
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={SHARED_ADMIN_EMAIL}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-white placeholder:text-slate-500 outline-hidden transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span>Mot de passe</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-3.5 pr-11 py-2.5 bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg text-sm text-white placeholder:text-slate-500 outline-hidden transition-colors"
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
              disabled={isLoading || isSuccess}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Connexion en cours...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Accéder au backoffice</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-900">
        Backoffice JEAN AUTO VSP · Accès commun sécurisé
      </footer>
    </div>
  );
};

