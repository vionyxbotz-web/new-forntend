import { memo } from "react";
import { AlertCircle } from "lucide-react";
import { HistorySkeleton } from "./LoadingSkeletons";

interface DeductionItem {
  id: string;
  amount: number;
  description: string;
  createdAt: string; // WIB formatted string from backend
  botPhone?: string;
  groupCount?: number;
  isDetailedLog?: boolean;
  details?: string;
}

interface DeductionHistoryProps {
  items: DeductionItem[];
  isLoading?: boolean;
}

const DeductionHistory = memo(function DeductionHistory({ items, isLoading = false }: DeductionHistoryProps) {
  if (isLoading) {
    return <HistorySkeleton itemCount={4} />;
  }

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
        <p className="text-[var(--foreground-muted)]">Belum ada riwayat pengurangan koin</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
      {items.map((it) => (
        <div
          key={it.id}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/40 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="text-[var(--foreground)] font-semibold">
                  - {it.amount} Koin
                </div>
                {it.isDetailedLog && it.botPhone && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-[var(--accent-glow)] text-[var(--accent)] border border-[var(--accent-border)]">
                    Bot {it.botPhone}
                  </span>
                )}
              </div>
              <div className="text-sm text-[var(--foreground-muted)] mb-1">
                {it.description}
              </div>
              {it.isDetailedLog && it.groupCount !== undefined && (
                <div className="text-xs text-[var(--foreground-subtle)]">
                  Grup: {it.groupCount} grup
                </div>
              )}
              {it.details && (
                <div className="text-xs text-[var(--foreground-subtle)] mt-1">
                  {it.details}
                </div>
              )}
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
              Deduction
            </span>
          </div>
          <div className="text-xs text-[var(--foreground-subtle)]">
            {it.createdAt}
          </div>
        </div>
      ))}
    </div>
  );
});

export default DeductionHistory;
