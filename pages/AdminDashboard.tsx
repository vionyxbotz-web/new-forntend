import { useState } from "react";
import { Users, Coins, Bot, TrendingUp, Package, Settings, Gift, MessageSquare, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import StatsCard from "@/components/StatsCard";
import AdminUserTable from "@/components/AdminUserTable";
import AdminTopUpTable from "@/components/AdminTopUpTable";
import AdminBlocksTable from "@/components/AdminBlocksTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import backend from "~backend/client";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminDashboard() {
  const { token } = useAuth();
  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => backend.admin.getStatistics(),
    staleTime: 2 * 60 * 1000, // ✅ Fresh for 2 minutes
    gcTime: 10 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000, // ✅ Auto-refetch every 3 minutes
  });

  const { data: usersData, refetch: refetchUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => backend.admin.listUsers(),
    staleTime: 3 * 60 * 1000, // ✅ Fresh for 3 minutes (users don't change often)
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false, // ✅ Don't refetch on focus (expensive query)
  });

  const { data: topupsData, isLoading: topupsLoading } = useQuery({
    queryKey: ["adminTopUps"],
    queryFn: () => backend.admin.listAllTopUps(),
    staleTime: 2 * 60 * 1000, // ✅ Fresh for 2 minutes
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false, // ✅ Don't refetch topup history on focus
  });

  const { data: blocksData, refetch: refetchBlocks, isLoading: blocksLoading } = useQuery({
    queryKey: ["adminBlocks"],
    queryFn: () => backend.admin.getBlocks(),
    staleTime: 30 * 1000, // ✅ Fresh for 30 seconds (blocks change frequently)
    gcTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // ✅ Auto-refetch every minute
    refetchOnWindowFocus: true, // ✅ Refetch when user focuses window
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 mt-20 min-h-screen">
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className={`text-4xl font-bold text-[var(--foreground)] mb-2`}>Admin Dashboard</h1>
              <p className="text-[var(--foreground-muted)]">Kelola platform Vionyx</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
              <Link to="/admin/config" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline" 
                  className="w-full border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent-glow)] transition-all"
                  size="sm"
                >
                  <Settings className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Config</span>
                </Button>
              </Link>
              <Link to="/admin/redeem-codes" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline" 
                  className="w-full border-[var(--accent-border)] text-[var(--accent-light)] hover:bg-[var(--accent-glow)] transition-all"
                  size="sm"
                >
                  <Gift className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Redeem</span>
                </Button>
              </Link>
              <Link to="/admin/testimonials" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline" 
                  className="w-full border-[rgba(34,197,94,0.20)] text-[#16A34A] dark:text-[#4ADE80] hover:bg-[rgba(34,197,94,0.12)] transition-all"
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Testimoni</span>
                </Button>
              </Link>
              <Link to="/admin/bots" className="flex-1 sm:flex-none">
                <Button 
                  variant="outline" 
                  className="w-full border-[rgba(234,179,8,0.20)] text-[#B45309] dark:text-[#FCD34D] hover:bg-[rgba(234,179,8,0.12)] transition-all"
                  size="sm"
                >
                  <Bot className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Bot</span>
                </Button>
              </Link>
              <Link to="/admin/coin-packages" className="flex-1 sm:flex-none">
                <Button 
                  className="w-full transition-all"
                  size="sm"
                >
                  <Package className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Paket</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={Users}
            title="Total User"
            value={stats?.totalUsers || 0}
            color="cyan"
          />
          <StatsCard
            icon={Coins}
            title="Total Top Up"
            value={stats?.totalTopUps || 0}
            color="blue"
          />
          <StatsCard
            icon={Bot}
            title="Bot Aktif"
            value={stats?.totalActiveBots || 0}
            color="purple"
          />
          <StatsCard
            icon={TrendingUp}
            title="Total Revenue"
            value={stats?.totalRevenue || 0}
            color="green"
          />
        </div>

        <div className="clay-card p-5 md:p-6 animate-fade-in">
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users">Manajemen User</TabsTrigger>
              <TabsTrigger value="topups">Histori Top Up</TabsTrigger>
              <TabsTrigger value="blocks" className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Blokir</span>
                {blocksData && blocksData.totalBlocked > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-[#EF4444] text-white rounded-full">
                    {blocksData.totalBlocked}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <AdminUserTable users={usersData?.users || []} onUpdate={refetchUsers} isLoading={usersLoading} />
            </TabsContent>

            <TabsContent value="topups" className="mt-6">
              <AdminTopUpTable topups={topupsData?.topups || []} isLoading={topupsLoading} />
            </TabsContent>

            <TabsContent value="blocks" className="mt-6">
              <AdminBlocksTable 
                blockedUsers={blocksData?.blockedUsers || []} 
                blockedIPs={blocksData?.blockedIPs || []} 
                onUpdate={refetchBlocks} 
                isLoading={blocksLoading} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
