import React, { useState } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Trash2,
  Shield,
  Mail,
  UserCheck
} from 'lucide-react';
import { WPUser, UserRole } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpUsersProps {
  users: WPUser[];
  isAddingNew: boolean;
  onCloseAddNew: () => void;
}

export const WpUsers: React.FC<WpUsersProps> = ({
  users,
  isAddingNew,
  onCloseAddNew,
}) => {
  const [showAddModal, setShowAddModal] = useState(isAddingNew);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('author');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (isAddingNew) {
      setShowAddModal(true);
    }
  }, [isAddingNew]);

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim()) return;

    setSaving(true);
    try {
      await WordPressFirebaseService.saveUser({
        username: username.toLowerCase().replace(/\s+/g, '_'),
        name: name || username,
        email,
        role,
      });
      setUsername('');
      setName('');
      setEmail('');
      setRole('author');
      setShowAddModal(false);
      onCloseAddNew();
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (id: string, userRole: UserRole) => {
    if (userRole === 'administrator' && users.filter((u) => u.role === 'administrator').length <= 1) {
      alert('Impossible de supprimer le dernier administrateur.');
      return;
    }
    if (confirm('Voulez-vous supprimer cet utilisateur ?')) {
      try {
        await WordPressFirebaseService.deleteUser(id);
      } catch (e: any) {
        alert(`Erreur: ${e.message}`);
      }
    }
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'administrator':
        return <span className="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded">Administrateur</span>;
      case 'editor':
        return <span className="bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">Éditeur</span>;
      case 'author':
        return <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">Auteur</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded">Abonné</span>;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-normal text-[#1d2327]">Utilisateurs</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1 border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded font-semibold transition-colors"
          >
            Ajouter un utilisateur
          </button>
        </div>
        <div className="text-gray-500">{users.length} utilisateur(s)</div>
      </div>

      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f0f1] border-b border-[#c3c4c7] text-gray-700 font-bold">
              <th className="p-3">Identifiant</th>
              <th className="p-3">Nom</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Rôle</th>
              <th className="p-3 text-center">Articles</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#f6f7f7] group">
                <td className="p-3">
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.username}`}
                      alt=""
                      className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                    />
                    <div>
                      <div className="font-bold text-[#2271b1]">{u.username}</div>
                      <div className="text-[11px] text-gray-400">Inscrit le {u.registeredAt}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-medium text-gray-800">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3">{getRoleBadge(u.role)}</td>
                <td className="p-3 text-center font-bold text-gray-700">{u.postCount}</td>
                <td className="p-3 text-right">
                  {u.role !== 'administrator' && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.role)}
                      className="text-red-600 hover:underline inline-flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-5 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-bold text-base text-gray-900">Ajouter un nouvel utilisateur</h3>
              <button
                onClick={() => { setShowAddModal(false); onCloseAddNew(); }}
                className="text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 py-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Identifiant (obligatoire)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: redaction_paul"
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Paul Martin"
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Adresse e-mail (obligatoire)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="paul@exemple.com"
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2 border border-gray-300 rounded focus:border-[#2271b1] outline-none font-medium"
                >
                  <option value="administrator">Administrateur (accès complet)</option>
                  <option value="editor">Éditeur (gestion de tous les articles/pages)</option>
                  <option value="author">Auteur (publication de ses propres articles)</option>
                  <option value="subscriber">Abonné (lecture seule)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); onCloseAddNew(); }}
                  className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded font-semibold text-gray-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 bg-[#2271b1] hover:bg-[#135e96] text-white rounded font-bold disabled:opacity-50"
                >
                  {saving ? 'Création...' : 'Ajouter l’utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
