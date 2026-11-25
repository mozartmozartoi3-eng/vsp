import React, { useState } from 'react';
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  CornerDownRight,
  Send,
  AlertCircle
} from 'lucide-react';
import { WPComment, WPPost } from '../../types/wordpress';
import { WordPressFirebaseService } from '../../services/wordpressService';

interface WpCommentsProps {
  comments: WPComment[];
  posts: WPPost[];
}

export const WpComments: React.FC<WpCommentsProps> = ({ comments, posts }) => {
  const [currentTab, setCurrentTab] = useState<'all' | 'pending' | 'approved' | 'trash'>('all');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const allCount = comments.filter((c) => c.status !== 'trash').length;
  const pendingCount = comments.filter((c) => c.status === 'pending').length;
  const approvedCount = comments.filter((c) => c.status === 'approved').length;
  const trashCount = comments.filter((c) => c.status === 'trash').length;

  const filteredComments = comments.filter((c) => {
    if (currentTab === 'all') return c.status !== 'trash';
    if (currentTab === 'pending') return c.status === 'pending';
    if (currentTab === 'approved') return c.status === 'approved';
    if (currentTab === 'trash') return c.status === 'trash';
    return true;
  });

  const handleStatusChange = async (id: string, status: WPComment['status']) => {
    try {
      await WordPressFirebaseService.updateCommentStatus(id, status);
    } catch (e: any) {
      alert(`Erreur: ${e.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer définitivement ce commentaire de Firebase ?')) {
      try {
        await WordPressFirebaseService.deleteComment(id);
      } catch (e: any) {
        alert(`Erreur: ${e.message}`);
      }
    }
  };

  const handleSendReply = async (parentComment: WPComment) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      await WordPressFirebaseService.addComment({
        postId: parentComment.postId,
        postTitle: parentComment.postTitle,
        authorName: 'admin (Administrateur)',
        authorEmail: 'admin@base-de-donnees-p.firebaseapp.com',
        content: replyText,
        status: 'approved',
        createdAt: new Date().toISOString(),
      });
      setReplyText('');
      setReplyingToId(null);
    } catch (e: any) {
      alert(`Erreur: ${e.message}`);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 text-xs">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-normal text-[#1d2327]">Commentaires</h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setCurrentTab('all')}
          className={`hover:text-[#2271b1] ${currentTab === 'all' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          Tous ({allCount})
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setCurrentTab('pending')}
          className={`hover:text-[#2271b1] ${currentTab === 'pending' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          En attente ({pendingCount})
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setCurrentTab('approved')}
          className={`hover:text-[#2271b1] ${currentTab === 'approved' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          Approuvés ({approvedCount})
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => setCurrentTab('trash')}
          className={`hover:text-[#2271b1] ${currentTab === 'trash' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
        >
          Corbeille ({trashCount})
        </button>
      </div>

      {/* Comments List */}
      <div className="bg-white border border-[#c3c4c7] rounded shadow-2xs overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f0f1] border-b border-[#c3c4c7] text-gray-700 font-bold">
              <th className="p-3 w-48">Auteur</th>
              <th className="p-3">Commentaire</th>
              <th className="p-3 w-48">En réponse à</th>
              <th className="p-3 w-32">Envoyé le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredComments.map((comment) => (
              <tr
                key={comment.id}
                className={`hover:bg-[#f6f7f7] group transition-colors ${
                  comment.status === 'pending' ? 'bg-amber-50/50' : ''
                }`}
              >
                <td className="p-3 align-top">
                  <div className="flex items-start space-x-2">
                    <img
                      src={comment.authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.authorName}`}
                      alt=""
                      className="w-8 h-8 rounded-full border border-gray-200"
                    />
                    <div>
                      <div className="font-bold text-gray-800">{comment.authorName}</div>
                      <div className="text-[11px] text-gray-500">{comment.authorEmail}</div>
                      {comment.status === 'pending' && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-semibold">
                          En attente
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="p-3 align-top">
                  <p className="text-gray-800 leading-relaxed">{comment.content}</p>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 text-[11px] text-gray-500 mt-2 opacity-0 group-hover:opacity-100">
                    {comment.status !== 'approved' && comment.status !== 'trash' && (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        className="text-emerald-700 hover:underline font-semibold"
                      >
                        Approuver
                      </button>
                    )}
                    {comment.status === 'approved' && (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'pending')}
                        className="text-amber-700 hover:underline"
                      >
                        Désapprouver
                      </button>
                    )}
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                      className="text-[#2271b1] hover:underline"
                    >
                      Répondre
                    </button>
                    <span className="text-gray-300">|</span>
                    {comment.status !== 'trash' ? (
                      <button
                        onClick={() => handleStatusChange(comment.id, 'trash')}
                        className="text-red-600 hover:underline"
                      >
                        Corbeille
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleStatusChange(comment.id, 'approved')}
                          className="text-emerald-700 hover:underline"
                        >
                          Rétablir
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-red-600 hover:underline"
                        >
                          Supprimer définitivement
                        </button>
                      </>
                    )}
                  </div>

                  {/* Inline Reply Form */}
                  {replyingToId === comment.id && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded space-y-2">
                      <div className="font-semibold text-gray-700">Répondre à {comment.authorName} :</div>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={2}
                        placeholder="Votre réponse..."
                        className="w-full p-2 border border-gray-300 rounded text-xs outline-none focus:border-[#2271b1]"
                      ></textarea>
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setReplyingToId(null)}
                          className="px-2.5 py-1 bg-gray-200 rounded text-gray-700"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleSendReply(comment)}
                          disabled={sendingReply || !replyText.trim()}
                          className="px-3 py-1 bg-[#2271b1] text-white rounded font-semibold disabled:opacity-50"
                        >
                          {sendingReply ? 'Envoi...' : 'Répondre'}
                        </button>
                      </div>
                    </div>
                  )}
                </td>

                <td className="p-3 align-top text-gray-600">
                  <div className="font-medium text-[#2271b1]">{comment.postTitle}</div>
                </td>

                <td className="p-3 align-top text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}

            {filteredComments.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400 italic">
                  Aucun commentaire dans cette vue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
