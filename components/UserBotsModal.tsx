import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmationModal from "./ConfirmationModal";
import { showErrorToast } from "@/lib/errorHandler";
import { getStoredToken } from "@/lib/apiClient";

interface Bot {
  _id?: string;
  id?: string;
  phoneNumber?: string;
  name?: string;
  status: string;
  createdAt?: string;
  expiresAt?: Date;
  online?: boolean;
  type?: string;
  groupsCount?: number;
  lastStatus?: {
    status?: string;
    at: string | null;
  };
}

interface UserBotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  bots: Bot[];
  onUpdate: () => void;
  token?: string; // ✅ Accept token as prop
}

export default function UserBotsModal({
  isOpen,
  onClose,
  username,
  bots,
  onUpdate,
  token: tokenProp
}: UserBotsModalProps) {
  const { toast } = useToast();
  const { token: tokenFromAuth } = useAuth();
  const token = tokenProp || tokenFromAuth; // ✅ Use prop first, fallback to useAuth
  const effectiveToken = token || getStoredToken();
  const [loadingBot, setLoadingBot] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'restart' | 'delete' | null;
    botId: string;
    displayName: string;
  }>({
    isOpen: false,
    type: null,
    botId: '',
    displayName: ''
  });

  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      botId: '',
      displayName: ''
    });
  };

  const handleAction = (type: 'restart' | 'delete', bot: Bot) => {
    const botId = bot.phoneNumber || bot._id || bot.id || '';
    const displayName = bot.name || bot.phoneNumber || botId;
    
    setConfirmModal({
      isOpen: true,
      type,
      botId,
      displayName
    });
  };

  const executeAction = async () => {
    const { type, botId, displayName } = confirmModal;
    
    // ✅ Check if token exists
    if (!effectiveToken) {
      toast({
        title: "Error",
        description: "Session expired. Please login again.",
        variant: "destructive",
      });
      setLoadingBot(null);
      return;
    }
    
    setLoadingBot(botId);
    closeConfirmModal();

    try {
      let endpoint = '';
      let body: any = {};
      let method = 'POST';
      let successMessage = '';

      switch (type) {
        case 'restart':
          endpoint = '/bot/restart';
          body = { botId, userId: username };
          successMessage = `Bot ${displayName} berhasil direstart`;
          break;
        
        case 'delete':
          endpoint = '/bot/delete';
          body = { botId, userId: username };
          successMessage = `Bot ${displayName} berhasil dihapus`;
          break;
      }

      console.log('[UserBotsModal] Making request:', {
        endpoint: `${baseUrl}${endpoint}`,
        hasToken: !!token,
        body
      });

      const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || `Failed (${response.status})`);
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Berhasil!",
          description: successMessage,
        });
        onUpdate();
      } else {
        throw new Error(result.message || 'Action failed');
      }
    } catch (error: any) {
      showErrorToast(toast, error, "Gagal Memproses", `Terjadi kesalahan saat ${type} bot`);
    } finally {
      setLoadingBot(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/70  z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="clay-card w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)]">
                      Bot {username}
                    </h2>
                    <p className="text-[var(--foreground-muted)] text-sm mt-1">
                      {bots.length} bot terdaftar
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors p-2 hover:bg-white/5 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                  {bots.length === 0 ? (
                    <div className="text-center py-12">
                      <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
                      <p className="text-[var(--foreground-muted)]">User ini belum memiliki bot</p>
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Nomor Bot</th>
                            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Tipe</th>
                            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Grup</th>
                            <th className="text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold">Status</th>
                            <th className="text-center py-3 px-4 text-[var(--foreground-muted)] font-semibold">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bots.map((bot, index) => {
                            const botKey = bot._id || bot.id || bot.phoneNumber || index;
                            const displayName = bot.phoneNumber || bot.name || '-';
                            const botId = bot.phoneNumber || bot.name || bot.id || '';
                            
                            // Compute online status (same logic as user dashboard)
                            const lastStatus = bot.lastStatus;
                            let isOnline: boolean;
                            if (bot.online !== undefined && bot.online !== null) {
                              isOnline = !!bot.online;
                            } else if (lastStatus && lastStatus.at) {
                              const atTime = new Date(lastStatus.at).getTime();
                              const diffMin = (Date.now() - atTime) / 60000;
                              isOnline = diffMin <= 5;
                            } else {
                              isOnline = bot.status === "active";
                            }
                            
                            return (
                              <motion.tr
                                key={botKey}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-[var(--border)] hover:bg-[var(--accent)]/5"
                              >
                                <td className="py-4 px-4">
                                  <span className="text-[var(--accent)] font-mono">{displayName}</span>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-[var(--foreground-muted)]">{bot.type || 'Per-Koin'}</span>
                                </td>
                                <td className="py-4 px-4">
                                  <span className="text-[var(--foreground-muted)]">{bot.groupsCount || 0}</span>
                                </td>
                                <td className="py-4 px-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      isOnline
                                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                                    }`}
                                  >
                                    {isOnline ? "Online" : "Offline"}
                                  </span>
                                  {lastStatus && lastStatus.at && (
                                    <div className="text-xs text-[var(--foreground-muted)] mt-1">Last: {lastStatus.at}</div>
                                  )}
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex gap-2 justify-center">
                                    <Button
                                      onClick={() => handleAction('restart', bot)}
                                      disabled={loadingBot === botId}
                                      size="sm"
                                      variant="outline"
                                      className="border-[var(--accent-border)] text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                                      title="Restart Bot"
                                    >
                                      <RefreshCw className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      onClick={() => handleAction('delete', bot)}
                                      disabled={loadingBot === botId}
                                      size="sm"
                                      variant="outline"
                                      className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                                      title="Hapus Bot Permanen"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </td>
                            </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={executeAction}
        title={
          confirmModal.type === 'restart' ? 'Restart Bot?' : 'Hapus Bot?'
        }
        description={
          confirmModal.type === 'restart' 
            ? `Yakin ingin restart bot ${confirmModal.displayName}? Bot akan disconnect dan connect kembali.`
            : `Yakin ingin menghapus bot ${confirmModal.displayName}? Tindakan ini tidak dapat dibatalkan.`
        }
        confirmText={
          confirmModal.type === 'restart' ? 'Restart' : 'Hapus'
        }
        confirmVariant={confirmModal.type === 'delete' ? 'destructive' : 'default'}
        icon={confirmModal.type === 'restart' ? 'restart' : 'delete'}
        isLoading={loadingBot !== null}
      />
    </>
  );
}
