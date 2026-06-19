import { useState, memo } from "react";
import { AlertCircle, Eye } from "lucide-react";
import type { AdminTopUp } from "~backend/admin/list_all_topups";
import { AdminTopUpTableSkeleton } from "./LoadingSkeletons";
import TopUpDetailModal from "./TopUpDetailModal";
import { Button } from "@/components/ui/button";

interface AdminTopUpTableProps {
  topups: AdminTopUp[];
  isLoading?: boolean;
}

const AdminTopUpTable = memo(function AdminTopUpTable({ topups, isLoading = false }: AdminTopUpTableProps) {
  const [selectedTopUp, setSelectedTopUp] = useState<AdminTopUp | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetail = (topup: AdminTopUp) => {
    setSelectedTopUp(topup);
    setIsDetailModalOpen(true);
  };
  // Show loading skeleton
  if (isLoading) {
    return <AdminTopUpTableSkeleton />;
  }
  
  // Show empty state
  if (topups.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
        <p className="text-[var(--foreground-muted)]">Belum ada riwayat top up</p>
      </div>
    );
  }

  return (
    <div className="clay-table-container overflow-auto">
      <table className="clay-table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Jumlah</th>
            <th>Metode</th>
            <th>Status</th>
            <th>Tanggal</th>
            <th className="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {topups.map((topup) => (
            <tr key={topup.id}>
              <td className="text-[var(--foreground-muted)]">{topup.id}</td>
              <td className="font-medium">{topup.userName}</td>
              <td className="text-[var(--accent)] font-semibold">{topup.amount} Koin</td>
              <td className="text-[var(--foreground-muted)]">{topup.method}</td>
              <td>
                <span
                  className={
                    topup.status === "success" || topup.status === "completed"
                      ? "clay-badge clay-badge-success"
                      : "clay-badge clay-badge-warning"
                  }
                >
                  {topup.status === "success" || topup.status === "completed" ? "Berhasil" : "Pending"}
                </span>
              </td>
              <td className="text-[var(--foreground-muted)]">
                {new Date(topup.createdAt).toLocaleString("id-ID")}
              </td>
              <td className="text-center">
                <Button
                  onClick={() => handleViewDetail(topup)}
                  size="sm"
                  variant="ghost"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Detail
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <TopUpDetailModal
        topup={selectedTopUp ? {
          id: selectedTopUp.id.toString(),
          amount: selectedTopUp.amount,
          method: selectedTopUp.method,
          status: selectedTopUp.status,
          createdAt: selectedTopUp.createdAt,
          previousBalance: selectedTopUp.previousBalance,
          newBalance: selectedTopUp.newBalance
        } : null}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        userName={selectedTopUp?.userName}
      />
    </div>
  );
});

export default AdminTopUpTable;
