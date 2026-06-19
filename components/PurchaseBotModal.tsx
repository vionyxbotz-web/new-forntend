import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import backend from "~backend/client";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface PurchaseBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const packages = [
  { type: "Starter", groups: 1, days: 7, price: 70 },
  { type: "Basic", groups: 3, days: 30, price: 900 },
  { type: "Pro", groups: 5, days: 30, price: 1500 },
  { type: "Premium", groups: 10, days: 30, price: 3000 },
];

export default function PurchaseBotModal({ isOpen, onClose, onSuccess }: PurchaseBotModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(packages[0]);
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await backend.bot.purchase({
        userId: user.name,
        name,
        type: selectedPackage.type,
        groupsCount: selectedPackage.groups,
        days: selectedPackage.days,
      });

      toast({
        title: "Bot berhasil dibeli!",
        description: `Bot ${name} telah aktif`,
      });

      onSuccess();
      onClose();
      setName("");
    } catch (error: any) {
      console.error(error);
      toast({
        title: getErrorTitle(error, "Pembelian gagal"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[var(--surface)]  z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[var(--surface)] border border-[var(--accent-border)] rounded-2xl p-8 z-50 shadow-2xl shadow-[var(--shadow-accent)]"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">Beli Bot Baru</h2>
              <button
                onClick={onClose}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePurchase} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[var(--border)]">
                  Nama Bot
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Contoh: Bot Bisnisku"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-[var(--surface)] border-[var(--accent-border)] focus:border-[var(--accent)] text-[var(--foreground)]"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[var(--border)]">Pilih Paket</Label>
                <div className="grid grid-cols-2 gap-3">
                  {packages.map((pkg) => (
                    <button
                      key={pkg.type}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPackage.type === pkg.type
                          ? "border-[var(--accent)] bg-[var(--accent-glow)] shadow-lg shadow-[var(--shadow-accent)]"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50"
                      }`}
                    >
                      <div className="text-[var(--foreground)] font-semibold mb-1">{pkg.type}</div>
                      <div className="text-sm text-[var(--foreground-muted)] mb-2">
                        {pkg.groups} Grup • {pkg.days} Hari
                      </div>
                      <div className="text-[var(--accent)] font-bold">{pkg.price} Koin</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--accent-glow)] border border-[var(--accent-border)] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--foreground-muted)]">Total Harga:</span>
                  <span className="text-2xl font-bold text-[var(--accent)]">
                    {selectedPackage.price} Koin
                  </span>
                </div>
                <div className="text-xs text-[var(--foreground-subtle)]">
                  {selectedPackage.groups} grup • {selectedPackage.days} hari
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-[var(--foreground)] font-semibold py-6 rounded-lg shadow-lg shadow-[var(--shadow-accent)] transition-all duration-300"
              >
                {loading ? (
                  "Memproses..."
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Beli Sekarang
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
