import React, { useState } from 'react';
import { Plug, Check, Database, Shield, Zap } from 'lucide-react';
import { firebaseConfig } from '../../firebase';

export const WpPlugins: React.FC = () => {
  const [plugins, setPlugins] = useState([
    {
      id: 'firebase-connector',
      name: 'Firebase Firestore Sync & Backoffice Pro',
      version: '3.1.0',
      author: 'Google Cloud & Firebase',
      description: `Connecte nativement toutes les publications, utilisateurs, réglages et médias au projet Firebase ${firebaseConfig.projectId}.`,
      active: true,
      locked: true,
    },
    {
      id: 'gutenberg',
      name: 'Gutenberg Block Editor',
      version: '18.4',
      author: 'L’équipe WordPress',
      description: 'L’éditeur moderne par blocs de WordPress pour concevoir des articles multimédias.',
      active: true,
      locked: false,
    },
    {
      id: 'akismet',
      name: 'Akismet Anti-Spam',
      version: '5.3.3',
      author: 'Automattic',
      description: 'Protège vos commentaires et formulaires de contact contre le contenu indésirable.',
      active: true,
      locked: false,
    },
    {
      id: 'yoast-seo',
      name: 'Yoast SEO',
      version: '22.8',
      author: 'Team Yoast',
      description: 'Optimisation complète du référencement naturel et méta-balises pour vos articles.',
      active: false,
      locked: false,
    },
  ]);

  const togglePlugin = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id && !p.locked ? { ...p, active: !p.active } : p))
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-300">
        <h1 className="text-2xl font-normal text-[#1d2327]">Extensions installées</h1>
        <span className="text-gray-500">{plugins.length} extension(s)</span>
      </div>

      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f0f1] border-b border-[#c3c4c7] text-gray-700 font-bold">
              <th className="p-3 w-64">Extension</th>
              <th className="p-3">Description</th>
              <th className="p-3 w-32 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plugins.map((plugin) => (
              <tr
                key={plugin.id}
                className={`hover:bg-[#f6f7f7] ${plugin.active ? 'bg-blue-50/20' : ''}`}
              >
                <td className="p-3 align-top">
                  <div className="font-bold text-sm text-gray-900">{plugin.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Version {plugin.version} | Par {plugin.author}
                  </div>
                  {plugin.locked && (
                    <span className="inline-block mt-1 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">
                      Extension système requise
                    </span>
                  )}
                </td>
                <td className="p-3 align-top text-gray-700 leading-relaxed">
                  {plugin.description}
                </td>
                <td className="p-3 align-top text-right">
                  {!plugin.locked ? (
                    <button
                      onClick={() => togglePlugin(plugin.id)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                        plugin.active
                          ? 'text-red-600 hover:bg-red-50 border border-red-200'
                          : 'bg-[#2271b1] text-white hover:bg-[#135e96]'
                      }`}
                    >
                      {plugin.active ? 'Désactiver' : 'Activer'}
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs">Actif (Connecteur)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
