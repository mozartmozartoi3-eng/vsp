import React, { useState } from 'react';
import {
  Globe,
  Save,
  CheckCircle,
  Search,
  Share2,
  FileCode,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { SeoSettings } from '../../../types/wordpress';
import { WordPressFirebaseService } from '../../../services/wordpressService';

interface WpSeoProps {
  seo: SeoSettings;
}

export const WpSeo: React.FC<WpSeoProps> = ({ seo }) => {
  const [formData, setFormData] = useState<SeoSettings>(seo);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'meta' | 'sitemap' | 'schema'>('meta');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await WordPressFirebaseService.updateSeoSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await WordPressFirebaseService.updateSeoSettings({
        ...formData,
        sitemapGeneratedAt: now,
      });
      setFormData((prev) => ({ ...prev, sitemapGeneratedAt: now }));
      alert('Sitemap.xml virtuel généré et mis à jour avec succès !');
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Globe className="w-6 h-6 text-[#2271b1]" />
          Référencement Naturel & SEO Technique
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Optimisez le positionnement Google de JEAN AUTO VSP sur les requêtes clés : "Voiture sans permis Aix-les-Bains", "Aixam occasion Savoie", "Garage VSP 73".
        </p>
      </div>

      {savedSuccess && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Paramètres SEO enregistrés avec succès.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('meta')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'meta'
              ? 'border-[#2271b1] text-[#2271b1]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Balises Meta & Aperçu Google
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'schema'
              ? 'border-[#2271b1] text-[#2271b1]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Données Structurées JSON-LD (AutoDealer)
        </button>
        <button
          onClick={() => setActiveTab('sitemap')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'sitemap'
              ? 'border-[#2271b1] text-[#2271b1]'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Sitemap & Robots.txt
        </button>
      </div>

      {activeTab === 'meta' && (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">Titre SEO Global (Balise &lt;title&gt;)</label>
                <span className={`text-[11px] font-mono ${formData.metaTitle.length > 60 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {formData.metaTitle.length} / 65 caractères recommandés
                </span>
              </div>
              <input
                type="text"
                required
                value={formData.metaTitle}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">Méta Description</label>
                <span className={`text-[11px] font-mono ${formData.metaDescription.length > 160 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {formData.metaDescription.length} / 160 caractères recommandés
                </span>
              </div>
              <textarea
                rows={3}
                required
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                className="w-full text-sm border border-gray-300 rounded p-3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">URL Canonique Principale</label>
                <input
                  type="url"
                  value={formData.canonicalUrl}
                  onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Image Open Graph (Partage Réseaux)</label>
                <input
                  type="url"
                  value={formData.ogImage}
                  onChange={(e) => setFormData({ ...formData, ogImage: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.allowRobotsIndex}
                  onChange={(e) => setFormData({ ...formData, allowRobotsIndex: e.target.checked })}
                  className="w-4 h-4 text-[#2271b1] rounded border-gray-300"
                />
                Autoriser l'indexation par Google (index, follow)
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.structuredDataEnabled}
                  onChange={(e) => setFormData({ ...formData, structuredDataEnabled: e.target.checked })}
                  className="w-4 h-4 text-[#2271b1] rounded border-gray-300"
                />
                Activer les données enrichies Schema.org
              </label>
            </div>
          </div>

          {/* SERP Google Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#2271b1]" />
              Aperçu du résultat Google (SERP Preview)
            </h2>

            <div className="p-4 bg-[#f8f9fa] rounded-lg border border-gray-200 max-w-xl">
              <div className="text-xs text-[#202124] flex items-center gap-1.5 mb-1">
                <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white font-bold">
                  J
                </div>
                <span className="font-medium text-gray-700">jean-auto-vsp.fr</span>
                <span className="text-gray-400">› vehicules</span>
              </div>

              <div className="text-[#1a0dab] hover:underline text-lg font-normal cursor-pointer leading-snug">
                {formData.metaTitle}
              </div>

              <p className="text-xs text-[#4d5156] mt-1.5 line-clamp-2 leading-relaxed">
                {formData.metaDescription}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications SEO'}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'schema' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-[#2271b1]" />
            Schéma structuré injecté pour Google (JSON-LD)
          </h2>
          <p className="text-xs text-gray-600">
            Ces balises permettent à Google de reconnaître JEAN AUTO VSP comme concessionnaire automobile local (AutoDealer) à Aix-les-Bains et d'afficher les avis, horaires et adresse.
          </p>

          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto">
{`{
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": "JEAN AUTO VSP",
  "image": "${formData.ogImage}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "11 Avenue du Grand Port",
    "addressLocality": "Aix-les-Bains",
    "postalCode": "73100",
    "addressCountry": "FR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.6961,
    "longitude": 5.9125
  },
  "url": "https://jean-auto-vsp.fr",
  "telephone": "+33259508931",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "08:30",
      "closes": "19:00"
    }
  ],
  "priceRange": "7000€ - 16000€",
  "makesOffer": {
    "@type": "Offer",
    "category": "Vehicles Without Permit (VSP)"
  }
}`}
          </pre>
        </div>
      )}

      {activeTab === 'sitemap' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Sitemap XML</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Dernière génération : {formData.sitemapGeneratedAt ? new Date(formData.sitemapGeneratedAt).toLocaleString('fr-FR') : 'Non généré'}
              </p>
            </div>

            <button
              onClick={handleGenerateSitemap}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-semibold rounded"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Régénérer le sitemap
            </button>
          </div>

          <div className="p-4 bg-gray-50 border border-gray-200 rounded font-mono text-xs text-gray-800 space-y-1">
            <div>https://jean-auto-vsp.fr/ (priorité 1.0)</div>
            <div>https://jean-auto-vsp.fr/vehicules (priorité 0.9)</div>
            <div>https://jean-auto-vsp.fr/comment-acheter (priorité 0.8)</div>
            <div>https://jean-auto-vsp.fr/contact (priorité 0.8)</div>
            <div>https://jean-auto-vsp.fr/faq (priorité 0.7)</div>
            <div>https://jean-auto-vsp.fr/mentions-legales (priorité 0.3)</div>
            <div>https://jean-auto-vsp.fr/cgv (priorité 0.3)</div>
          </div>
        </div>
      )}
    </div>
  );
};
