import { useState, memo } from "react";
import { motion } from "framer-motion";
import { RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import backend from "~backend/client";
import type { Bot } from "~backend/bot/list_bots";
import { BotTableSkeleton } from "./LoadingSkeletons";
import ConfirmationModal from "./ConfirmationModal";
import { getStoredToken } from "@/lib/apiClient";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface BotTableProps {
  bots: Bot[];
  onUpdate: () => void;
  isLoading?: boolean;
}

const BotTable = memo(function BotTable({ bots, onUpdate, isLoading = false }: BotTableProps) {
  const { user, token } = useAuth(); // ✅ Get token
  const { toast } = useToast();
  const [loadingBot, setLoadingBot] = useState<string | null>(null);
  const effectiveToken = token || getStoredToken();
  
  // Modal states
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

  const closeModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      botId: '',
      displayName: ''
    });
  };

  const handleRestart = async (botId: string, displayName: string) => {
    if (!user) return;
    
    // Show confirmation modal
    setConfirmModal({
      isOpen: true,
      type: 'restart',
      botId,
      displayName
    });
  };

  const executeRestart = async () => {
    const { botId, displayName } = confirmModal;
    if (!user || !effectiveToken) {
      toast({
        title: "Error",
        description: "Session expired. Please login again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoadingBot(botId);

    try {
      // Call backend restart endpoint
      const backendUrl = import.meta.env.VITE_CLIENT_TARGET || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/bot/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`, // ✅ Add token
        },
        body: JSON.stringify({
          botId: botId,
          userId: user.username, // Use username instead of id for SC BOT
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw { status: response.status, body, message: body?.error, code: body?.code };
      }

      const result = await response.json();
      console.log('Restart response:', result);

      if (result.success) {
        toast({
          title: "Koneksi bot berhasil direstart",
          description: "Bot sedang menghubungkan kembali, harap tunggu beberapa saat",
        });
        onUpdate();
      } else {
        throw { status: response.status, body: result, message: result?.error || result?.message, code: result?.code };
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: getErrorTitle(error, "Restart gagal"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoadingBot(null);
      closeModal();
    }
  };

  const handleDelete = async (botId: string, displayName: string) => {
    if (!user) return;
    
    // Show confirmation modal
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      botId,
      displayName
    });
  };

  const executeDelete = async () => {
    const { botId, displayName } = confirmModal;
    if (!user || !effectiveToken) {
      toast({
        title: "Error",
        description: "Session expired. Please login again.",
        variant: "destructive",
      });
      return;
    }
    
    setLoadingBot(botId);

    try {
      // Use backend endpoint as proxy to avoid CORS issues
      console.log('Attempting to delete bot via backend proxy:', { botId, userId: user.name });
      
      const backendUrl = import.meta.env.VITE_CLIENT_TARGET || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/bot/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`, // ✅ Add token
        },
        body: JSON.stringify({
          botId: botId,
          userId: user.username, // Use username instead of id for SC BOT
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw { status: response.status, body, message: body?.error, code: body?.code };
      }

      const result = await response.json();
      console.log('Delete response:', result);

      if (result.success) {
        toast({
          title: "Bot berhasil dihapus",
          description: "Bot telah dihapus secara permanen",
        });
        onUpdate();
      } else {
        throw { status: response.status, body: result, message: result?.error || result?.message, code: result?.code };
      }
    } catch (error: any) {
      console.error(error);
      const errorBody = error.body;
      if (errorBody && typeof errorBody === 'object') {
        const errorTitle = getErrorTitle(error, "Penghapusan gagal");
        const errorMessage = getErrorMessage(error) || "Terjadi kesalahan";
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Penghapusan gagal",
          description: "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingBot(null);
      closeModal();
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <BotTableSkeleton />;
  }

  // Show empty state only when not loading and no bots
  if (bots.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
        </motion.div>
        <p className="text-[var(--foreground-muted)]">Anda belum memiliki bot aktif</p>
      </motion.div>
    );
  }

  return (
    <div className="clay-table-container overflow-auto">
      <table className="clay-table w-full">
        <thead>
          <tr>
            <th>No</th>
            <th>Tipe</th>
            <th>Grup</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {bots.map((bot, index) => {
            // Prefer phoneNumber as display name
            const displayName = (bot as any).phoneNumber || bot.name;
            // Use phoneNumber as botId for SC BOT API (same as AdminBotTable)
            const botId = (bot as any).phoneNumber || bot.name || bot.id;
            const lastStatus = (bot as any).lastStatus as { status: string; at: string | null } | undefined;
            // Compute online: use backend-provided boolean when available, otherwise infer from lastStatus timestamp (5 minutes)
            let isOnline: boolean;
            if ((bot as any).online !== undefined && (bot as any).online !== null) {
              isOnline = !!(bot as any).online;
            } else if (lastStatus && lastStatus.at) {
              const atTime = new Date(lastStatus.at).getTime();
              const diffMin = (Date.now() - atTime) / 60000;
              isOnline = diffMin <= 5;
            } else {
              // fallback to stored status
              isOnline = bot.status === "active";
            }
            return (
              <motion.tr
                key={bot.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="font-medium">{displayName}</td>
                <td className="text-[var(--foreground-muted)]">{bot.type}</td>
                <td className="text-[var(--foreground-muted)]">{bot.groupsCount}</td>
                <td>
                  <span className={`clay-badge ${isOnline ? "clay-badge-success" : "clay-badge-danger"}`}>
                    {isOnline ? "Online" : "Offline"}
                  </span>
                  {lastStatus && lastStatus.at && (
                    <div className="text-xs text-[var(--foreground-subtle)] mt-1">Last: {lastStatus.at}</div>
                  )}
                </td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => handleRestart(botId, displayName)}
                      disabled={loadingBot === botId}
                      title="Restart Bot"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => handleDelete(botId, displayName)}
                      disabled={loadingBot === botId}
                      className="!text-[#EF4444]"
                      title="Hapus Bot Permanen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={closeModal}
        onConfirm={confirmModal.type === 'restart' ? executeRestart : executeDelete}
        title={
          confirmModal.type === 'restart' 
            ? `Restart Bot ${confirmModal.displayName}?`
            : `Hapus Bot ${confirmModal.displayName}?`
        }
        description={
          confirmModal.type === 'restart'
            ? "Koneksi bot akan diputus dan disambungkan kembali. Proses ini membutuhkan beberapa detik."
            : "Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data sesi bot secara permanen."
        }
        confirmText={confirmModal.type === 'restart' ? "Restart Bot" : "Hapus Bot"}
        confirmVariant={confirmModal.type === 'restart' ? "default" : "destructive"}
        icon={confirmModal.type === 'restart' ? "restart" : "delete"}
        isLoading={loadingBot === confirmModal.botId}
      />
    </div>
  );
});

export default BotTable;
