import { useState, memo } from "react";
import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

const RedeemCodeCard = memo(function RedeemCodeCard() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleRedeem = async () => {
    if (!code.trim()) {
      toast({
        title: "Kode Kosong",
        description: "Masukkan kode redeem terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User tidak ditemukan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';
      const response = await fetch(`${baseUrl}/redeem/use`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.toUpperCase(),
          username: user.name,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "🎉 Berhasil!",
          description: `Selamat! Anda mendapat ${data.data.coinsAdded} coins! Saldo baru: ${data.data.newBalance} coins`,
        });
        
        // Reset form
        setCode("");
        
        // Refresh balance
        queryClient.invalidateQueries({ queryKey: ["balance", user.name] });
      } else {
        throw { status: response.status, body: data, message: data.error, code: data.code };
      }
    } catch (error: any) {
      console.error("Error redeeming code:", error);
      toast({
        title: getErrorTitle(error, "Gagal Redeem"),
        description: getErrorMessage(error) || "Terjadi kesalahan saat redeem kode",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleRedeem();
    }
  };

  return (
    <div className="clay-card !bg-[var(--accent-glow)] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-[var(--accent)] rounded-[var(--radius)] shadow-[var(--shadow-accent)]">
          <Gift className="w-6 h-6 text-[var(--foreground)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Kode Redeem</h2>
          <p className="text-[var(--foreground-muted)] text-sm">Dapatkan coins gratis!</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="Masukkan kode redeem"
            maxLength={12}
            disabled={isLoading}
            className="clay-input text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:border-[var(--accent)] transition-all uppercase pr-10"
          />
          {code && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
          )}
        </div>

        <Button
          onClick={handleRedeem}
          disabled={isLoading || !code.trim()}
          className="w-full"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memproses...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              <span>Redeem Sekarang</span>
            </div>
          )}
        </Button>

        <div className="clay-card-sm p-4">
          <p className="text-xs text-[var(--foreground-muted)] text-center">
            💡 <span className="text-[var(--accent-light)]">Tips:</span> Dapatkan kode redeem dari event,
            giveaway, atau promo spesial kami!
          </p>
        </div>
      </div>
    </div>
  );
});

export default RedeemCodeCard;
