import { useState, useEffect } from "react";
import { Coins, Bot, History, Settings, RefreshCw, MessageCircle } from "lucide-react";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import BotTable from "@/components/BotTable";
import TopUpHistory from "@/components/TopUpHistory";
import DeductionHistory from "@/components/DeductionHistory";
import ConnectBotModal from "@/components/ConnectBotModal";
import BotConfigModal from "@/components/BotConfigModal";
import RedeemCodeCard from "@/components/RedeemCodeCard";
import TestimonialForm from "@/components/TestimonialForm";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { showErrorToast } from "@/lib/errorHandler";
import { getStoredToken } from "@/lib/apiClient";

export default function UserDashboard() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isCleaningBots, setIsCleaningBots] = useState(false);
  const effectiveToken = token || getStoredToken();

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["balance", user?.name],
    queryFn: () => backend.coin.getBalance({ userId: user!.name }),
    enabled: !!user,
    staleTime: 30 * 1000, // ✅ Consider data fresh for 30s (reduces API calls)
    gcTime: 5 * 60 * 1000, // ✅ Keep in cache for 5 minutes
    refetchOnWindowFocus: true, // ✅ Refetch when user returns to tab
  });

  const { data: botsData, refetch: refetchBots, isLoading: botsLoading, error: botsError } = useQuery({
    queryKey: ["bots", user?.name],
    queryFn: async () => {
      const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/bot/list/${encodeURIComponent(user!.name)}`, {
        headers: effectiveToken ? {
          'Authorization': `Bearer ${effectiveToken}`,
        } : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch bots' }));
        throw new Error(error.error || `Failed to fetch bots (${response.status})`);
      }

      return response.json();
    },
    enabled: !!user && !!effectiveToken,
    retry: false,
    staleTime: 3 * 60 * 1000, // ✅ Consider data fresh for 3 minutes (reduced API calls)
    gcTime: 15 * 60 * 1000, // ✅ Keep in cache for 15 minutes
    refetchInterval: 5 * 60 * 1000, // ✅ Auto-refetch every 5 minutes (aligned with bot status updates)
    refetchOnWindowFocus: false, // ✅ Disable to reduce unnecessary API calls
  });

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["topupHistory", user?.name],
    queryFn: () => backend.coin.getHistory({ userId: user!.name }),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // ✅ Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // ✅ Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // ✅ Don't refetch history on focus (not critical)
  });

  const { data: deductionsData, isLoading: deductionsLoading } = useQuery({
    queryKey: ["deductions", user?.id],
    queryFn: () => backend.coin.getDeductions({ userId: user!.id }),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // ✅ Consider data fresh for 10 minutes (deductions not critical)
    gcTime: 30 * 60 * 1000, // ✅ Keep in cache for 30 minutes
    refetchInterval: false, // ✅ Disable auto-refetch, only refetch on manual action
    refetchOnWindowFocus: false,
  });

  // Show error toast if bots fetch fails
  useEffect(() => {
    if (botsError) {
      console.error('[Dashboard] Error fetching bots:', botsError);
      showErrorToast(toast, botsError, 'Gagal Memuat Bot', 'Tidak dapat memuat daftar bot Anda');
    }
  }, [botsError, toast]);

  const handleCleanupOrphanedBots = async () => {
    if (!user || !effectiveToken) return;

    try {
      setIsCleaningBots(true);
      console.log('[FRONTEND] Calling cleanup orphaned bots for user:', user.name);

      // Manual fetch dengan Authorization header
      const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/bot/cleanup-orphaned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${effectiveToken}`,  // ✅ Include JWT token
        },
        body: JSON.stringify({ username: user.username }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to cleanup bots' }));
        throw new Error(error.error || `Failed to cleanup (${response.status})`);
      }

      const result = await response.json();

      console.log('[FRONTEND] Cleanup result:', result);

      if (!result.success) {
        toast({
          title: "Konfigurasi Diperlukan",
          description: result.message || "URL Jadibot Server belum dikonfigurasi. Hubungi admin.",
          variant: "destructive",
        });
        return;
      }

      if (result.cleanedBotsCount > 0) {
        toast({
          title: "Sync Bot Berhasil!",
          description: `${result.cleanedBotsCount} bot yang tidak valid telah dihapus`,
        });
        refetchBots();
      } else {
        toast({
          title: "Sync Bot Selesai",
          description: "Semua bot sudah sinkron, tidak ada bot yang perlu dihapus",
        });
      }
    } catch (error: any) {
      console.error("[FRONTEND] Error cleaning orphaned bots:", error);
      showErrorToast(toast, error, "Gagal Membersihkan Bot", "Terjadi kesalahan saat membersihkan bot");
    } finally {
      setIsCleaningBots(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-y-auto bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] mb-2">
            Selamat Datang, {user?.name}!
          </h1>
          <p className="text-[var(--foreground-muted)]">Kelola bot WhatsApp Anda dengan mudah</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            icon={Coins}
            title="Saldo Koin"
            value={balance?.coins || 0}
            color="cyan"
            isLoading={balanceLoading}
          />
          <StatsCard
            icon={Bot}
            title="Bot Aktif"
            value={botsData?.bots?.filter((b: any) => b.status === "active").length || 0}
            color="blue"
            isLoading={botsLoading}
          />
          <StatsCard
            icon={History}
            title="Total Top Up"
            value={historyData?.topups.length || 0}
            color="purple"
            isLoading={historyLoading}
          />
        </div>

        {/* Redeem Code Section */}
        <div className="mb-8">
          <RedeemCodeCard />
        </div>

        {/* Testimonial Section - Only show if user has top up history */}
        {historyData?.topups && historyData.topups.length > 0 && (
          <div className="mb-8">
            <TestimonialForm />
          </div>
        )}

        {/* WhatsApp Group Info Section */}
        <div className="mb-8">
          <div className="clay-card-sm p-5 md:p-6 !bg-[rgba(34,197,94,0.06)] dark:!bg-[rgba(34,197,94,0.08)] !border-[rgba(34,197,94,0.20)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-[rgba(34,197,94,0.15)] rounded-[var(--radius)] flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-[#16A34A] dark:text-[#4ADE80]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-[var(--foreground)] mb-2">💬 Butuh Bantuan atau Punya Ide?</h3>
                <p className="text-[var(--foreground-muted)] text-sm mb-3">
                  Gabung ke grup WhatsApp kami untuk tanya-tanya, request fitur, atau diskusi seputar bot!
                </p>
                <a
                  href="https://chat.whatsapp.com/CZArnIjCrp49mwJ1Bwq59M?mode=wwc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="clay-btn inline-flex items-center gap-2 !min-h-[44px] px-5 !bg-[#16A34A] hover:!bg-[#15803D] !text-white font-semibold !shadow-[0_4px_14px_rgba(34,197,94,0.30)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  Gabung Grup WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6 mb-8">
          <div className="clay-card p-5 md:p-6 lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
                Bot Saya
              </h2>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleCleanupOrphanedBots}
                  disabled={isCleaningBots}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  title="Sinkronkan bot dengan server (hapus bot yang session-nya hilang)"
                >
                  <RefreshCw className={`w-4 h-4 sm:mr-2 ${isCleaningBots ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Sync Bot</span>
                </Button>
                <Button
                  onClick={() => setIsConfigModalOpen(true)}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Config</span>
                </Button>
                <Button
                  onClick={() => setIsConnectModalOpen(true)}
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Bot className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Sambungkan Bot</span>
                </Button>
              </div>
            </div>
            <BotTable
              bots={botsData?.bots || []}
              onUpdate={refetchBots}
              isLoading={botsLoading}
            />
          </div>

          <div className="clay-card p-5 md:p-6">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-4">
              Histori Top Up
            </h2>
            <TopUpHistory
              topups={historyData?.topups || []}
              isLoading={historyLoading}
            />
          </div>

          <div className="clay-card p-5 md:p-6 lg:col-span-3">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-4">
              Histori Pengurangan Koin per Bot
            </h2>
            <DeductionHistory
              items={deductionsData?.deductions || []}
              isLoading={deductionsLoading}
            />
          </div>
        </div>
      </main>
      <ConnectBotModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onSuccess={refetchBots}
        balance={balance}
      />

      <BotConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
}
