import React, { useState } from 'react';
import { HelpCircle, Plus, Edit2, Trash2, X } from 'lucide-react';
import { FaqItem } from '../../../types/wordpress';
import { WordPressFirebaseService } from '../../../services/wordpressService';

interface WpFaqsProps {
  faqs: FaqItem[];
}

export const WpFaqs: React.FC<WpFaqsProps> = ({ faqs }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Général');
  const [order, setOrder] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    setSaving(true);
    try {
      await WordPressFirebaseService.saveFaq({
        id: editingId || undefined,
        question: question.trim(),
        answer: answer.trim(),
        category: category.trim(),
        order: Number(order) || 1,
      });
      setQuestion('');
      setAnswer('');
      setCategory('Général');
      setOrder(faqs.length + 1);
      setEditingId(null);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setQuestion(item.question);
    setAnswer(item.answer);
    setCategory(item.category);
    setOrder(item.order);
  };

  const handleDelete = async (id: string, q: string) => {
    if (confirm(`Supprimer la question "${q}" ?`)) {
      try {
        await WordPressFirebaseService.deleteFaq(id);
      } catch (err: any) {
        alert(`Erreur : ${err.message}`);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-[#2271b1]" />
          Foire Aux Questions (FAQ) Commerciale
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Questions-réponses affichées sur la page d'accueil et la section FAQ pour rassurer les acheteurs sur l'acompte de 150 €, la livraison et les garanties.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-4 pb-2 border-b">
            {editingId ? 'Modifier la question' : 'Ajouter une question / réponse'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Question *</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="ex: Comment payer l'acompte de 150 € ?"
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Catégorie</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="ex: Paiement & Acompte, Réglementation..."
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full text-sm border border-gray-300 rounded px-3 py-1.5"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Réponse détaillée *</label>
              <textarea
                rows={5}
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Explication claire et rassurante..."
                className="w-full text-sm border border-gray-300 rounded p-2.5"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#2271b1] hover:bg-[#135e96] text-white text-xs font-bold rounded shadow-sm disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter à la FAQ'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => { setEditingId(null); setQuestion(''); setAnswer(''); }}
                  className="px-3 py-2 border border-gray-300 text-gray-600 rounded"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {faqs.map((f) => (
            <div key={f.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-[#2271b1] bg-blue-50 px-2 py-0.5 rounded mr-2">
                    {f.category}
                  </span>
                  <span className="text-xs text-gray-400">Ordre : {f.order}</span>
                  <h3 className="font-bold text-gray-900 text-sm mt-1.5">{f.question}</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(f)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id, f.question)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 whitespace-pre-line leading-relaxed">
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
