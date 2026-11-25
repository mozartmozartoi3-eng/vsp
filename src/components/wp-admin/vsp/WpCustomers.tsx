import React, { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { CustomerRecord } from '../../../types/wordpress';

interface WpCustomersProps {
  customers: CustomerRecord[];
}

export const WpCustomers: React.FC<WpCustomersProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-[#2271b1]" />
            Clients & Prospects VSP
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Fichier clients ayant initié une commande ou réservé un véhicule sans permis chez JEAN AUTO VSP.
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white border border-gray-200 rounded p-4 mb-6 shadow-sm">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher un client (nom, email, ville, téléphone)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#2271b1]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#f6f7f7] border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Coordonnées</th>
              <th className="py-3 px-4">Localisation</th>
              <th className="py-3 px-4">Commandes</th>
              <th className="py-3 px-4">Total Versé</th>
              <th className="py-3 px-4">Dernière Activité</th>
              <th className="py-3 px-4 text-right">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500">
                  <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  Aucun client enregistré.
                </td>
              </tr>
            ) : (
              filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {cust.firstName} {cust.lastName}
                  </td>
                  <td className="py-3 px-4 text-xs space-y-0.5">
                    <div>{cust.email}</div>
                    <div className="text-gray-500">{cust.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600">
                    <div>{cust.city} ({cust.postalCode})</div>
                    <div className="text-gray-400">{cust.address}</div>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold text-gray-800">
                    {cust.ordersCount} commande{cust.ordersCount > 1 ? 's' : ''}
                  </td>
                  <td className="py-3 px-4 text-xs font-bold text-[#135e96]">
                    {cust.totalSpent.toLocaleString('fr-FR')} €
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {new Date(cust.lastOrderDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                    <a
                      href={`https://wa.me/${cust.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 inline-flex text-emerald-600 hover:bg-emerald-50 rounded"
                      title="Contacter sur WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                    <a
                      href={`mailto:${cust.email}`}
                      className="p-1.5 inline-flex text-blue-600 hover:bg-blue-50 rounded"
                      title="Envoyer un e-mail"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <a
                      href={`tel:${cust.phone}`}
                      className="p-1.5 inline-flex text-gray-700 hover:bg-gray-100 rounded"
                      title="Appeler"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
