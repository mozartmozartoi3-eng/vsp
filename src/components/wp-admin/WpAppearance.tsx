import React, { useState } from 'react';
import { Palette, Check, Sparkles, Eye } from 'lucide-react';

export const WpAppearance: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState('twentytwentyfour');

  const themes = [
    {
      id: 'twentytwentyfour',
      name: 'Twenty Twenty-Four',
      version: '1.2',
      author: 'L’équipe WordPress',
      description: 'Conçu pour être flexible, polyvalent et applicable à n’importe quel site web avec intégration native des données Firebase.',
      preview: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'twentytwentythree',
      name: 'Twenty Twenty-Three',
      version: '1.4',
      author: 'L’équipe WordPress',
      description: 'Un thème bloc épuré conçu pour mettre en valeur les typographies et les espaces clairs.',
      preview: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'twentytwentytwo',
      name: 'Twenty Twenty-Two',
      version: '1.7',
      author: 'L’équipe WordPress',
      description: 'Construit sur une base de blocs solides inspirés par la nature et les oiseaux.',
      preview: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-gray-300">
        <h1 className="text-2xl font-normal text-[#1d2327]">Thèmes</h1>
        <span className="text-gray-500">{themes.length} thèmes installés</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          return (
            <div
              key={theme.id}
              className={`bg-white rounded border overflow-hidden shadow-2xs transition-all ${
                isActive ? 'border-[#2271b1] ring-2 ring-[#2271b1]/20' : 'border-[#c3c4c7]'
              }`}
            >
              <div className="h-44 overflow-hidden relative group">
                <img src={theme.preview} alt={theme.name} className="w-full h-full object-cover" />
                {isActive && (
                  <div className="absolute top-2 left-2 bg-[#2271b1] text-white font-bold px-2.5 py-1 rounded text-[11px] flex items-center space-x-1 shadow">
                    <Check className="w-3.5 h-3.5" />
                    <span>Actif</span>
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-gray-900">{theme.name}</h3>
                  <span className="text-[11px] text-gray-400">v{theme.version}</span>
                </div>
                <p className="text-gray-600 line-clamp-2 text-[11px]">{theme.description}</p>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-gray-400 text-[10px]">Par {theme.author}</span>
                  {!isActive ? (
                    <button
                      onClick={() => setActiveTheme(theme.id)}
                      className="px-3 py-1 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-semibold text-xs"
                    >
                      Activer
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs">Thème actuel</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
