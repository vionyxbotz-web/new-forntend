import { useState, memo } from "react";
import { RefreshCw, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import ConfirmationModal from "./ConfirmationModal";
import { AdminBotTableSkeleton } from "./LoadingSkeletons";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

// AdminBot interface from accurate endpoint
interface AdminBot {
  id: string;
  userName: string;
  userId?: string;
  name: string;
  phoneNumber?: string;
  type: string;
  groupsCount: number;
  status: string;
  online?: boolean;
  lastStatus?: {
    status?: string;
    at: string | null;
  };
}

interface AdminBotTableProps {
  bots: AdminBot[];
  onUpdate: () => void;
  isLoading?: boolean;
}

const AdminBotTable = memo(function AdminBotTable({ bots, onUpdate, isLoading = false }: AdminBotTableProps) {
  const { toast } = useToast();
  const { token } = useAuth(); // ✅ Get token for Authorization
  const [loadingBot, setLoadingBot] = useState<string | null>(null);

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'restart' | 'delete' | null;
    botId: string;
    userId: string;
    displayName: string;
  }>({
    isOpen: false,
    type: null,
    botId: '',
    userId: '',
    displayName: ''
  });

  const closeModal = () => {
    setConfirmModal({
      isOpen: false,
      type: null,
      botId: '',
      userId: '',
      displayName: ''
    });
  };

  const handleRestart = async (botId: string, userId: string, displayName: string) => {
    // Show confirmation modal
    setConfirmModal({
      isOpen: true,
      type: 'restart',
      botId,
      userId,
      displayName
    });
  };

  const executeRestart = async () => {
    const { botId, userId } = confirmModal;
    setLoadingBot(botId);

    try {
      // Call backend restart endpoint
      const backendUrl = import.meta.env.VITE_CLIENT_TARGET || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/bot/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '', // ✅ Add Authorization token
        },
        body: JSON.stringify({
          botId: botId,
          userId: userId,
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

  const handleDelete = async (botId: string, userId: string, displayName: string) => {
    // Show confirmation modal
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      botId,
      userId,
      displayName
    });
  };

  const executeDelete = async () => {
    const { botId, userId } = confirmModal;
    setLoadingBot(botId);

    try {
      console.log('Attempting to delete bot via backend proxy:', { botId, userId });
      
      const backendUrl = import.meta.env.VITE_CLIENT_TARGET || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/bot/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '', // ✅ Add Authorization token
        },
        body: JSON.stringify({
          botId: botId,
          userId: userId,
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
      toast({
        title: getErrorTitle(error, "Penghapusan gagal"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoadingBot(null);
      closeModal();
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <AdminBotTableSkeleton />;
  }

  // Show empty state only when not loading and no bots
  if (bots.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
        <p className="text-[var(--foreground-muted)]">Tidak ada bot yang ditemukan</p>
      </div>
    );
  }

  return (
    <div className="clay-table-container overflow-auto">
      <table className="clay-table w-full">
        <thead>
          <tr>
            <th>User</th>
            <th>No</th>
            <th>Tipe</th>
            <th>Grup</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {bots.filter(bot => bot && bot.id).map((bot, index) => {
            
            // Prefer phoneNumber as display name
            const displayName = bot.phoneNumber || bot.name || bot.id;
            // Use phoneNumber as botId for SC BOT API (same as user dashboard)
            const botId = bot.phoneNumber || bot.name || bot.id;
            const lastStatus = bot.lastStatus;
            // Compute online: use backend-provided boolean when available, otherwise infer from lastStatus timestamp (5 minutes)
            let isOnline: boolean;
            if (bot.online !== undefined && bot.online !== null) {
              isOnline = !!bot.online;
            } else if (lastStatus && lastStatus.at) {
              const atTime = new Date(lastStatus.at).getTime();
              const diffMin = (Date.now() - atTime) / 60000;
              isOnline = diffMin <= 5;
            } else {
              // fallback to stored status
              isOnline = bot.status === "active";
            }
            
            return (
              <tr key={bot.id}>
                <td className="text-[var(--accent)] font-semibold">{bot.userName}</td>
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
                      onClick={() => handleRestart(botId, bot.userName || String(bot.userId), displayName)}
                      disabled={loadingBot === botId}
                      title="Restart Bot"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => handleDelete(botId, bot.userName || String(bot.userId), displayName)}
                      disabled={loadingBot === botId}
                      className="!text-[#EF4444]"
                      title="Hapus Bot Permanen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
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

export default AdminBotTable;
