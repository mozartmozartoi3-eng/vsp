import React, { useState } from 'react';
import { Lock, Mail, KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle, Chrome, Cloud } from 'lucide-react';
import { signInAdminWithGoogle, signInWithSharedCredentials, ADMIN_EMAIL } from '../../firebase';

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
  const [cloudSyncWarning, setCloudSyncWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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

  const handleGoogleSignIn = async () => {
    setError(null);
    setCloudSyncWarning(null);
    setIsGoogleLoading(true);
    try {
      const user = await signInAdminWithGoogle();
      setIsSuccess(true);
      persistAdminSession(user.email || ADMIN_EMAIL);
      setTimeout(() => {
        setIsGoogleLoading(false);
        onLoginSuccess();
      }, 300);
    } catch (err: any) {
      setIsGoogleLoading(false);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('La fenêtre de connexion Google a été fermée avant la validation.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Le navigateur a bloqué la fenêtre Google. Autorisez les pop-ups pour ce site puis réessayez.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Ce domaine doit être ajouté dans Firebase Authentication > Paramètres > Domaines autorisés.');
      } else {
        setError(err?.message || 'Erreur lors de la connexion Google.');
      }
    }
  };

  const handleContinueLocalOnly = () => {
    persistAdminSession(email.trim().toLowerCase() || ADMIN_EMAIL);
    setIsSuccess(true);
    setTimeout(() => {
      onLoginSuccess();
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCloudSyncWarning(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanEmail === ADMIN_EMAIL && cleanPassword === 'Panneliste3@') {
      setIsLoading(true);
      const authRes = await signInWithSharedCredentials(cleanEmail, cleanPassword);
      setIsLoading(false);

      if (authRes.firebaseAuthenticated) {
        setIsSuccess(true);
        persistAdminSession(cleanEmail);
        setTimeout(() => {
          onLoginSuccess();
        }, 300);
      } else {
        setCloudSyncWarning(
          authRes.errorMessage ||
            `La synchronisation Cloud Firebase par mot de passe n'est pas encore active. Cliquez sur "Connexion Google partagée (Cloud)" ci-dessus pour synchroniser vos véhicules entre le propriétaire et le concepteur.`
        );
      }
    } else {
      setError('Identifiants invalides. Utilisez l’accès commun administrateur.');
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
              Un seul accès commun synchronisé en temps réel sur tous vos appareils
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {cloudSyncWarning && (
            <div className="mb-5 p-4 bg-amber-950/70 border border-amber-700/80 rounded-lg space-y-3 text-xs text-amber-100">
              <div className="flex items-start gap-2.5">
                <Cloud className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block text-amber-200 mb-1">
                    Synchronisation Cloud non active avec le mot de passe seul
                  </strong>
                  <span>{cloudSyncWarning}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Chrome className="w-4 h-4 text-blue-600" />
                  <span>Se connecter avec Google (Synchronisation immédiate)</span>
                </button>
                <button
                  type="button"
                  onClick={handleContinueLocalOnly}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Entrer quand même en mode local (cet appareil uniquement)
                </button>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-800/80 rounded-lg flex items-center gap-2.5 text-xs text-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>Connexion réussie. Ouverture du backoffice...</div>
            </div>
          )}

          {/* Shared Google Sign-In for Cloud Firestore synchronization */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-60 mb-5"
          >
            {isGoogleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                <span>Connexion Google en cours...</span>
              </>
            ) : (
              <>
                <Chrome className="w-4 h-4 text-blue-600" />
                <span>Connexion Google partagée (Recommandé · Cloud)</span>
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold">
                Ou identifiants communs
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>E-mail commun</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ADMIN_EMAIL}
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
              disabled={isLoading || isGoogleLoading}
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

