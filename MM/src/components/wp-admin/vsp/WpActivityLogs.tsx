import React from 'react';
import { Activity, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { ActivityLog } from '../../../types/wordpress';

interface WpActivityLogsProps {
  logs: ActivityLog[];
}

export const WpActivityLogs: React.FC<WpActivityLogsProps> = ({ logs }) => {
  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#2271b1]" />
          Journal d'Activité & Audit
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Historique en direct de toutes les actions commerciales : créations de commandes, téléversement de preuves de virement, modifications de statut et de catalogue.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-100">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              Aucune activité enregistrée récemment.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-[#2271b1] rounded-full mt-0.5 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900">{log.action}</span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(log.timestamp).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{log.details}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                    <span>Par : <strong>{log.author}</strong></span>
                    {log.ip && <span>· IP : {log.ip}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
