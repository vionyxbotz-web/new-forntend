import { motion, AnimatePresence } from "framer-motion";
import { X, User, Calendar, CheckCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UsedByItem {
  username: string;
  usedAt: string;
}

interface RedeemUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  coins: number;
  usedBy: UsedByItem[];
  maxUses: number;
  currentUses: number;
}

export default function RedeemUsageModal({
  isOpen,
  onClose,
  code,
  coins,
  usedBy,
  maxUses,
  currentUses,
}: RedeemUsageModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--surface)]  z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-[var(--surface)] to-black border border-[var(--accent-border)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[var(--accent)] p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(0,0,0,0.2)]" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                      <TrendingUp className="w-6 h-6" />
                      Detail Penggunaan Kode
                    </h2>
                    <button
                      onClick={onClose}
                      className="text-white/80 hover:text-[var(--foreground)] transition-colors p-2 hover:bg-white/10 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-3xl font-mono font-bold text-[var(--accent)] bg-[var(--accent-glow)] px-4 py-2 rounded-[var(--radius-sm)]">
                      {code}
                    </span>
                    <div className="text-white/90">
                      <p className="text-sm">Reward</p>
                      <p className="text-xl font-bold">{coins.toLocaleString()} Coins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-6 bg-[var(--surface-raised)]">
                <div className="clay-card-sm !bg-[var(--accent-glow)] p-4">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">Total Penggunaan</p>
                  <p className="text-3xl font-bold text-[var(--accent)]">
                    {currentUses} <span className="text-lg text-[var(--foreground-subtle)]">/ {maxUses}</span>
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">Coins Terdistribusi</p>
                  <p className="text-3xl font-bold text-green-400">
                    {(currentUses * coins).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* User List */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--accent-light)]" />
                  Digunakan Oleh ({usedBy.length})
                </h3>

                {usedBy.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[var(--surface-raised)] rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-[var(--foreground-muted)]" />
                    </div>
                    <p className="text-[var(--foreground-muted)]">Belum ada yang menggunakan kode ini</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {usedBy.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="clay-card-sm !bg-[var(--accent-glow)] p-4 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[var(--accent)] rounded-full flex items-center justify-center shrink-0">
                              <User className="w-5 h-5 text-[var(--foreground)]" />
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                                {item.username}
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </p>
                              <p className="text-sm text-[var(--foreground-muted)] flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(item.usedAt).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-[var(--foreground-subtle)]">Mendapat</p>
                            <p className="text-lg font-bold text-yellow-400">
                              +{coins.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[var(--border)] p-6 bg-[var(--surface-raised)]">
                <Button
                  onClick={onClose}
                  className="w-full"
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
