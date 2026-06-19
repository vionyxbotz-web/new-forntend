import { useState, memo } from "react";
import { AlertCircle, Eye } from "lucide-react";
import type { TopUpHistory } from "~backend/coin/get_history";
import { HistorySkeleton } from "./LoadingSkeletons";
import TopUpDetailModal from "./TopUpDetailModal";
import { Button } from "@/components/ui/button";

interface TopUpHistoryProps {
  topups: TopUpHistory[];
  isLoading?: boolean;
}

const TopUpHistory = memo(function TopUpHistory({ topups, isLoading = false }: TopUpHistoryProps) {
  const [selectedTopUp, setSelectedTopUp] = useState<TopUpHistory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetail = (topup: TopUpHistory) => {
    setSelectedTopUp(topup);
    setIsDetailModalOpen(true);
  };
  if (isLoading) {
    return <HistorySkeleton itemCount={3} />;
  }

  if (topups.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
        <p className="text-[var(--foreground-muted)]">Belum ada riwayat top up</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
      {topups.map((topup) => (
        <div
          key={topup.id}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/40 hover:scale-[1.02] transition-all duration-200"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="text-[var(--foreground)] font-semibold">
                {topup.amount} Koin
              </div>
              <div className="text-sm text-[var(--foreground-muted)]">
                {topup.method}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  topup.status === "success" || topup.status === "completed"
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                }`}
              >
                {topup.status === "success" || topup.status === "completed" ? "Berhasil" : "Pending"}
              </span>
              <Button
                onClick={() => handleViewDetail(topup)}
                size="sm"
                variant="ghost"
                className="text-[var(--accent)] hover:text-[var(--accent-light)] hover:bg-[var(--accent-glow)]"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="text-xs text-[var(--foreground-subtle)]">
            {new Date(topup.createdAt).toLocaleString("id-ID")}
          </div>
        </div>
      ))}

      <TopUpDetailModal
        topup={selectedTopUp}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
});

export default TopUpHistory;
