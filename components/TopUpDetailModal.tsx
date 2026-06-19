import { memo } from "react";
import { X, Calendar, CreditCard, Hash, CheckCircle, TrendingUp, Coins } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TopUpDetail {
  id: string;
  amount: number;
  method: string;
  status: string;
  createdAt: Date;
  previousBalance?: number;
  newBalance?: number;
}

interface TopUpDetailModalProps {
  topup: TopUpDetail | null;
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const TopUpDetailModal = memo(function TopUpDetailModal({
  topup,
  isOpen,
  onClose,
  userName,
}: TopUpDetailModalProps) {
  if (!topup) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[var(--surface)] border-[var(--accent-border)] max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-[var(--foreground)] text-xl flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[var(--accent)]" />
            Detail Top Up
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar"
          style={{
            maxHeight: "calc(90vh - 100px)",
          }}
        >
          {/* Status Badge */}
          <div className="flex justify-center py-3">
            <span
              className={`px-6 py-2 rounded-full text-sm font-semibold ${
                topup.status === "success" || topup.status === "completed"
                  ? "bg-green-500/20 text-green-400 border-2 border-green-500/50"
                  : "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50"
              }`}
            >
              {topup.status === "success" || topup.status === "completed"
                ? "✓ Pembayaran Berhasil"
                : "⏳ Menunggu Pembayaran"}
            </span>
          </div>

          {/* Amount Card */}
          <div className="clay-card-sm !bg-[var(--accent-glow)] p-6 text-center">
            <div className="text-sm text-[var(--foreground-muted)] mb-2">Jumlah Top Up</div>
            <div className="text-4xl font-bold text-[var(--accent)]">
              {topup.amount.toLocaleString("id-ID")}
            </div>
            <div className="text-lg text-[var(--foreground-muted)] mt-1">Koin</div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            {userName && (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--accent-glow)] rounded-full flex items-center justify-center">
                    <span className="text-[var(--accent)] text-sm">👤</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-[var(--foreground-muted)]">User</div>
                    <div className="text-[var(--foreground)] font-medium">{userName}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--accent-glow)] rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[var(--foreground-muted)]">Metode Pembayaran</div>
                  <div className="text-[var(--foreground)] font-medium">{topup.method}</div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[var(--accent-glow)] rounded-full flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-[var(--accent-light)]" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[var(--foreground-muted)]">Tanggal & Waktu</div>
                  <div className="text-[var(--foreground)] font-medium">
                    {new Date(topup.createdAt).toLocaleString("id-ID", {
                      dateStyle: "long",
                      timeStyle: "short",
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                  <Hash className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-[var(--foreground-muted)]">ID Transaksi</div>
                  <div className="text-[var(--foreground)] font-mono text-sm">{topup.id}</div>
                </div>
              </div>
            </div>

            {/* Balance Information */}
            {(topup.previousBalance !== undefined || topup.newBalance !== undefined) && (
              <div className="clay-card-sm !bg-[var(--accent-glow)] p-4 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <Coins className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--foreground-muted)]">Koin Sebelumnya</div>
                      <div className="text-[var(--foreground)] font-bold text-lg">
                        {topup.previousBalance?.toLocaleString("id-ID") || "0"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <TrendingUp className="w-6 h-6 text-[var(--accent)] mx-3" />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[var(--accent-glow)] rounded-full flex items-center justify-center">
                      <Coins className="w-5 h-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="text-xs text-[var(--foreground-muted)]">Koin Sesudahnya</div>
                      <div className="text-[var(--accent)] font-bold text-lg">
                        {topup.newBalance?.toLocaleString("id-ID") || "0"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Calculation Display */}
                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <div className="text-center text-xs text-[var(--foreground-muted)]">
                    {topup.previousBalance?.toLocaleString("id-ID") || "0"} + {topup.amount.toLocaleString("id-ID")} = {topup.newBalance?.toLocaleString("id-ID") || "0"} Koin
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

export default TopUpDetailModal;
