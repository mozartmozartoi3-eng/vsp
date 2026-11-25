import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Navigation } from 'lucide-react';
import { CommercialBankSettings } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';
import { WhatsAppIcon } from '../common/WhatsAppIcon';

interface FrontContactProps {
  commercialSettings: CommercialBankSettings;
}

export const FrontContact: React.FC<FrontContactProps> = ({ commercialSettings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await WordPressFirebaseService.logActivity({
        action: 'Demande de contact reçue',
        entityId: `inquiry-${Date.now()}`,
        details: `Demande de contact de ${name} (${phone}, ${email}) : "${message.slice(0, 80)}..."`,
        user: name,
        entityType: 'customer',
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-12 sm:py-16 bg-slate-50 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Nous rencontrer ou nous écrire
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            Contact et horaires de la concession
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left: Dealership Details */}
          <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Coordonnées directes</h2>

            <div className="space-y-4 text-sm text-slate-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-slate-900 font-semibold">
                    {commercialSettings.companyName}
                  </strong>
                  <span>{commercialSettings.address}</span>
                  <br />
                  <span>
                    {commercialSettings.postalCode} {commercialSettings.city}, {commercialSettings.country}
                  </span>
                  {commercialSettings.landmark && (
                    <div className="text-xs text-slate-500 mt-1">{commercialSettings.landmark}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Téléphone</span>
                  <a
                    href={`tel:${commercialSettings.phone.replace(/[^0-9+]/g, '')}`}
                    className="font-semibold text-slate-900 hover:text-blue-700"
                  >
                    {commercialSettings.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">WhatsApp</span>
                  <a
                    href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    {commercialSettings.whatsapp}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">E-mail</span>
                  <a
                    href={`mailto:${commercialSettings.email}`}
                    className="font-semibold text-slate-900 hover:text-blue-700"
                  >
                    {commercialSettings.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <Clock className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <span className="text-xs text-slate-500 block">Horaires</span>
                  <span className="font-medium text-slate-900">
                    {commercialSettings.openingHours}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `${commercialSettings.address}, ${commercialSettings.postalCode} ${commercialSettings.city}, France`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Ouvrir dans Google Maps</span>
              </a>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="w-full lg:w-1/2 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Envoyer un message</h2>
              <p className="text-xs text-slate-600 mt-1">
                Renseignez vos coordonnées pour être recontacté sous 24h par la concession.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
                <h3 className="font-semibold text-emerald-900 text-sm">
                  Message envoyé avec succès
                </h3>
                <p className="text-xs text-emerald-800">
                  Notre équipe vous répondra dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom et prénom *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Sophie Laurent"
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="06 00 00 00 00"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nom@exemple.com"
                      className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Votre message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Indiquez le modèle souhaité ou votre question..."
                    className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Envoi en cours...' : 'Envoyer le message'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
