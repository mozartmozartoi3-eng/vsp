import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Building,
  Navigation
} from 'lucide-react';
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
      // Save contact inquiry as customer activity log
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
    <section id="contact" className="py-12 bg-slate-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact & Address Information */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span>Adresse & Contact Concession</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-bold">JEAN AUTO VSP</strong>
                    <span>{commercialSettings.address}</span>
                    <br />
                    <span>{commercialSettings.postalCode} {commercialSettings.city}, France</span>
                    <div className="mt-1 text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded inline-block">
                      {commercialSettings.landmark}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-gray-500 block text-xs">Téléphone standard commercial :</span>
                    <a
                      href={`tel:${commercialSettings.phone}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                    >
                      {commercialSettings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366] shrink-0" />
                  <div>
                    <span className="text-gray-500 block text-xs">Assistance directe WhatsApp :</span>
                    <a
                      href={`https://wa.me/${commercialSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-700 hover:underline text-sm"
                    >
                      {commercialSettings.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Mail className="w-5 h-5 text-purple-600 shrink-0" />
                  <div>
                    <span className="text-gray-500 block text-xs">E-mail commercial :</span>
                    <a
                      href={`mailto:${commercialSettings.email}`}
                      className="font-bold text-slate-900 hover:text-blue-600 text-sm"
                    >
                      {commercialSettings.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-gray-500 block text-xs">Horaires d'ouverture :</span>
                    <span className="font-semibold text-slate-800">{commercialSettings.openingHours}</span>
                  </div>
                </div>
              </div>

              {/* Itinerary Link */}
              <div className="pt-4 border-t border-gray-100">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent('11 Avenue du Grand Port, 73100 Aix-les-Bains, France')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span>Ouvrir l'itinéraire Google Maps</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Envoyer un message à la concession</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Une question sur un modèle, une demande d'essai ou d'estimation ? Réponse rapide sous 24h.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-emerald-900 text-sm">Message transmis avec succès !</h4>
                  <p className="text-xs text-emerald-700">
                    Notre conseiller commercial prendra contact avec vous dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Votre Nom & Prénom *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="ex: Sophie Laurent"
                      className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">Téléphone *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="06 00 00 00 00"
                        className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">E-mail</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Votre message ou question *</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Je souhaite avoir plus de précisions sur..."
                      className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sending ? 'Envoi en cours...' : 'Envoyer mon message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
