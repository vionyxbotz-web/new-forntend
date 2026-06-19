import { useState } from "react";
import { motion } from "framer-motion";
import { Bot as BotIcon, Eye, Users, RefreshCw, Settings } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import UserBotsModal from "@/components/UserBotsModal";
import BotConfigModal from "@/components/BotConfigModal";
import backend from "~backend/client";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface BotData {
  id: string;
  userId?: number | string;
  userName?: string;
  name: string;
  phoneNumber?: string;
  type: string;
  groupsCount: number;
  expiresAt?: Date;
  status: string;
  online?: boolean;
  lastStatus?: {
    status?: string;
    at: string | null;
  };
}

interface UserBotSummary {
  username: string;
  totalBots: number;
  activeBots: number;
  bots: BotData[];
}

export default function AdminBots() {
  const { toast } = useToast();
  const { token, user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserBotSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [syncingUser, setSyncingUser] = useState<string | null>(null);
  const [configUsername, setConfigUsername] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';

  // Fetch all bots using the new accurate endpoint (single request)
  const { data: botsData, isLoading, error, refetch } = useQuery({
    queryKey: ["adminBotsAccurate"],
    queryFn: async () => {
      if (!token) return null;
      
      const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';
      
      try {
        const response = await fetch(`${baseUrl}/bot/admin/list-all-accurate`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch bots (${response.status})`);
        }
        
        return await response.json();
      } catch (err) {
        console.error('Error fetching accurate bots:', err);
        throw err;
      }
    },
    enabled: !!token,
    retry: false,
    staleTime: 1 * 60 * 1000, // ✅ Fresh for 1 minute
    gcTime: 10 * 60 * 1000, // ✅ Keep in cache for 10 minutes
    refetchInterval: 2 * 60 * 1000, // ✅ Auto-refetch every 2 minutes for realtime updates
    refetchOnWindowFocus: false, // ✅ Expensive query, manual refetch only
  });

  const allBots: BotData[] = botsData?.bots || [];

  // Group bots by username
  const userSummaries: UserBotSummary[] = Array.from(
    allBots.reduce((acc, bot) => {
      const username = bot.userName || 'Unknown';  // ✅ Use userName from AdminBot interface
      
      if (!acc.has(username)) {
        acc.set(username, {
          username,
          totalBots: 0,
          activeBots: 0,
          bots: []
        });
      }
      
      const summary = acc.get(username)!;
      summary.totalBots++;
      
      // Check online status (use online field from accurate endpoint)
      if (bot.online === true || bot.status === 'active') {
        summary.activeBots++;
      }
      
      summary.bots.push(bot);
      
      return acc;
    }, new Map<string, UserBotSummary>()).values()
  );

  const handleViewBots = (user: UserBotSummary) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleModalUpdate = () => {
    refetch(); // Refresh data after bot action
  };

  const handleSyncBots = async (username: string) => {
    setSyncingUser(username);
    
    try {
      const response = await fetch(`${baseUrl}/bot/cleanup-orphaned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw { status: response.status, body: error, message: error?.error, code: error?.code };
      }

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Sync Berhasil!",
          description: result.message || `Bot user ${username} berhasil disinkronkan`,
        });
        refetch();
      } else {
        throw { status: response.status, body: result, message: result?.error || result?.message, code: result?.code };
      }
    } catch (error: any) {
      toast({
        title: getErrorTitle(error, "Sync Gagal"),
        description: getErrorMessage(error) || 'Terjadi kesalahan saat sync bot',
        variant: "destructive",
      });
    } finally {
      setSyncingUser(null);
    }
  };

  const handleConfigUser = (username: string) => {
    setConfigUsername(username);
    setIsConfigModalOpen(true);
  };

  const handleCloseConfigModal = () => {
    setIsConfigModalOpen(false);
    setConfigUsername(null);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-3`}>
                <BotIcon className="w-10 h-10 text-[var(--accent)]" />
                Manage Bot User
              </h1>
              <p className="text-[var(--foreground-muted)]">Kelola bot dari semua user</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Total User</p>
            <p className="text-3xl font-bold text-[var(--accent-light)]">{userSummaries.length}</p>
          </div>
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Total Bot</p>
            <p className={`text-3xl font-bold text-[var(--foreground)]`}>{allBots.length}</p>
          </div>
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Bot Aktif</p>
            <p className="text-3xl font-bold text-[#16A34A] dark:text-[#4ADE80]">
              {allBots.filter(b => b.status === 'active').length}
            </p>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`clay-card p-6`}
        >
          <h2 className={`text-2xl font-bold text-[var(--foreground)] mb-6`}>
            Daftar User ({userSummaries.length})
          </h2>

          {isLoading ? (
            <div className={`text-center py-8 text-[var(--foreground-muted)]`}>Loading...</div>
          ) : error ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[#EF4444] mx-auto mb-4" />
              <p className="text-[#EF4444] font-semibold mb-2">Akses Ditolak</p>
              <p className="text-[var(--foreground-muted)]">
                {error instanceof Error && error.message.includes('403') 
                  ? 'Anda tidak memiliki akses admin. Silakan login sebagai admin.'
                  : 'Gagal memuat data bot. Silakan coba lagi.'}
              </p>
            </div>
          ) : userSummaries.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
              <p className="text-[var(--foreground-muted)]">Belum ada user dengan bot</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b var(--border)`}>
                    <th className={`text-left py-3 px-4 text-[var(--foreground-muted)] font-semibold`}>Username</th>
                    <th className={`text-center py-3 px-4 text-[var(--foreground-muted)] font-semibold`}>Total Bot</th>
                    <th className={`text-center py-3 px-4 text-[var(--foreground-muted)] font-semibold`}>Bot Aktif</th>
                    <th className={`text-center py-3 px-4 text-[var(--foreground-muted)] font-semibold`}>Bot Offline</th>
                    <th className={`text-center py-3 px-4 text-[var(--foreground-muted)] font-semibold`}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {userSummaries.map((user, index) => (
                    <motion.tr
                      key={user.username}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[var(--border)] hover:bg-[var(--accent)]/5"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center">
                            <span className="text-[var(--foreground)] font-bold text-lg">
                              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            </span>
                          </div>
                          <span className={`text-[var(--foreground)] font-medium`}>{user.username || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[var(--foreground)] font-bold text-lg`}>{user.totalBots}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[#16A34A] dark:text-[#4ADE80] font-semibold">{user.activeBots}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-[#EF4444] font-semibold">
                          {user.totalBots - user.activeBots}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            onClick={() => handleSyncBots(user.username)}
                            disabled={syncingUser === user.username}
                            size="sm"
                            variant="outline"
                            className="border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                            title="Sync Bot"
                          >
                            <RefreshCw className={`w-4 h-4 ${syncingUser === user.username ? 'animate-spin' : ''}`} />
                          </Button>
                          <Button
                            onClick={() => handleConfigUser(user.username)}
                            size="sm"
                            variant="outline"
                            className="border-[var(--accent-border)] text-[var(--accent-light)] hover:bg-[var(--accent-glow)]"
                            title="Konfigurasi User"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleViewBots(user)}
                            size="sm"
                            className=""
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Detail
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </main>

      {/* User Bots Modal */}
      {selectedUser && (
        <UserBotsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          username={selectedUser.username}
          bots={selectedUser.bots}
          onUpdate={handleModalUpdate}
          token={token || undefined}
        />
      )}

      {/* Bot Config Modal */}
      <BotConfigModal
        isOpen={isConfigModalOpen}
        onClose={handleCloseConfigModal}
        targetUsername={configUsername || undefined}
      />
    </div>
  );
}
