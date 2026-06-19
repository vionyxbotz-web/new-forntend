import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Copy, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Loader2,
  ArrowLeft,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface Transaction {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_name: string;
  amount: number;
  coins: number;
  fee_merchant: number;
  fee_customer: number;
  total_fee: number;
  status: string;
  pay_code: string;
  checkout_url: string;
  expired_time: number;
  qr_string: string | null;
  qr_url: string | null;
  instructions: Array<{
    title: string;
    steps: string[];
  }>;
  createdAt: string;
}

export default function PaymentDetail() {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    if (reference) {
      fetchTransaction();
      const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [reference]);

  useEffect(() => {
    if (transaction) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const remaining = transaction.expired_time - now;
        
        if (remaining <= 0) {
          setTimeRemaining("Expired");
        } else {
          const hours = Math.floor(remaining / 3600);
          const minutes = Math.floor((remaining % 3600) / 60);
          const seconds = remaining % 60;
          setTimeRemaining(`${hours}j ${minutes}m ${seconds}d`);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [transaction]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const response = await backend.payment.getTransaction({ reference: reference! });
      setTransaction(response);
    } catch (error: any) {
      console.error("Error fetching transaction:", error);
      toast({
        title: getErrorTitle(error, "Gagal memuat transaksi"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkStatus = async () => {
    if (!reference || checking) return;
    
    try {
      setChecking(true);
      const response = await backend.payment.checkStatus({ reference });
      
      // Refresh transaction data
      await fetchTransaction();
      
      if (response.status === "PAID") {
        toast({
          title: "Pembayaran Berhasil!",
          description: "Koin telah ditambahkan ke akun Anda",
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else if (response.status === "UNPAID") {
        toast({
          title: "Menunggu Pembayaran",
          description: "Transaksi belum dibayar",
          variant: "default",
        });
      } else if (response.status === "EXPIRED") {
        toast({
          title: "Transaksi Kadaluarsa",
          description: "Silakan buat transaksi baru",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error checking status:", error);
      toast({
        title: getErrorTitle(error, "Gagal memeriksa status"),
        description: getErrorMessage(error) || "Gagal memeriksa status pembayaran",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Disalin!",
      description: "Kode pembayaran telah disalin",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <div className="flex items-center space-x-2 text-green-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Dibayar</span>
          </div>
        );
      case "UNPAID":
        return (
          <div className="flex items-center space-x-2 text-yellow-400">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">Menunggu Pembayaran</span>
          </div>
        );
      case "EXPIRED":
        return (
          <div className="flex items-center space-x-2 text-red-400">
            <XCircle className="h-5 w-5" />
            <span className="font-semibold">Kadaluarsa</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 text-[var(--foreground-muted)]">
            <Clock className="h-5 w-5" />
            <span className="font-semibold">{status}</span>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[var(--bg)]">
        <Header />
        <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 mt-20">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--accent)]" />
            <span className={`ml-3 text-[var(--foreground)] text-lg`}>Memuat transaksi...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="relative min-h-screen bg-[var(--bg)]">
        <Header />
        <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 mt-20">
          <div className="text-center py-20">
            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold text-[var(--foreground)] mb-2`}>Transaksi Tidak Ditemukan</h2>
            <Button onClick={() => navigate("/topup")} className="mt-4">
              Kembali ke Top Up
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 mt-20">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 text-[var(--accent)] hover:text-[var(--accent-light)]"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className={`bg-[var(--surface)] border border-[var(--border)] p-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className={`text-2xl font-bold text-[var(--foreground)] mb-1`}>Detail Pembayaran</h1>
                <p className={`text-sm text-[var(--foreground-muted)]`}>Ref: {transaction.reference}</p>
              </div>
              {getStatusBadge(transaction.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div>
                <p className={`text-sm text-[var(--foreground-muted)]`}>Metode Pembayaran</p>
                <p className={`text-lg font-semibold text-[var(--foreground)]`}>{transaction.payment_name}</p>
              </div>
              <div>
                <p className={`text-sm text-[var(--foreground-muted)]`}>Jumlah Koin</p>
                <p className="text-lg font-semibold text-[var(--accent)]">{transaction.coins} Koin</p>
              </div>
              <div>
                <p className={`text-sm text-[var(--foreground-muted)]`}>Total Pembayaran</p>
                <p className={`text-lg font-semibold text-[var(--foreground)]`}>
                  Rp {transaction.amount.toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className={`text-sm text-[var(--foreground-muted)]`}>Waktu Tersisa</p>
                <p className="text-lg font-semibold text-yellow-400">{timeRemaining}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {transaction.status === "UNPAID" && transaction.pay_code && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-light)]/10  border border-[var(--accent-border)] p-6">
              <h2 className={`text-xl font-bold text-[var(--foreground)] mb-4`}>Kode Pembayaran</h2>
              <div className="flex items-center justify-between bg-[var(--surface)] rounded-lg p-4">
                <code className="text-2xl font-mono font-bold text-[var(--accent)]">
                  {transaction.pay_code}
                </code>
                <Button
                  onClick={() => copyToClipboard(transaction.pay_code)}
                  variant="ghost"
                  size="sm"
                  className="text-[var(--accent)] hover:text-[var(--accent-light)]"
                >
                  <Copy className="h-5 w-5" />
                </Button>
              </div>
              {transaction.qr_url && (
                <div className="mt-4 text-center">
                  <img
                    src={transaction.qr_url}
                    alt="QR Code"
                    className="mx-auto max-w-xs border border-[var(--border)] rounded-lg"
                  />
                </div>
              )}
            </Card>
          </motion.div>
        )}


        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            onClick={checkStatus}
            disabled={checking || transaction.status === "PAID"}
            className="flex-1 text-[var(--foreground)] font-semibold py-6"
          >
            {checking ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Memeriksa Status...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Cek Status Pembayaran
              </>
            )}
          </Button>
          {transaction.checkout_url && (
            <Button
              onClick={() => window.open(transaction.checkout_url, "_blank")}
              variant="outline"
              className="flex-1 border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent-glow)] py-6"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Buka Halaman Pembayaran
            </Button>
          )}
        </motion.div>
      </main>
    </div>
  );
}
