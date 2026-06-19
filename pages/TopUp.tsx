import React, { useState, useEffect } from "react";
import { Coins, Loader2, Phone } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import backend from "~backend/client";
import { showErrorToast } from "@/lib/errorHandler";
import { useNavigate } from "react-router-dom";

interface CoinPackage {
  _id: string;
  coins: number;
  price: number;
  active: boolean;
}

declare global {
  interface Window {
    snap: any;
  }
}

export default function TopUp() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [selectedPrice, setSelectedPrice] = useState<number>(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingFee, setLoadingFee] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [feeData, setFeeData] = useState<any>(null);
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("QRIS");
  const [pendingTransactions, setPendingTransactions] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingSnapPayment, setLoadingSnapPayment] = useState(false);

  useEffect(() => {
    fetchCoinPackages();
    fetchPendingTransactions();
    // Load Midtrans SNAP script
    const loadMidtransScript = () => {
      if (window.snap) {
        console.log("Midtrans SNAP already loaded");
        return;
      }
      
      const script = document.createElement("script");
      script.src = "https://app.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", "Mid-client-GU2zkernb3K8H84a");
      script.async = true;
      script.onload = () => {
        console.log("Midtrans SNAP script loaded successfully");
      };
      script.onerror = () => {
        console.error("Failed to load Midtrans SNAP script");
      };
      document.head.appendChild(script);
    };
    
    loadMidtransScript();
  }, []);

  const fetchCoinPackages = async () => {
    try {
      setLoadingPackages(true);
      const response = await backend.coin.getPackages();
      setCoinPackages(response.packages);
      
      // Set default selected package
      if (response.packages.length > 0) {
        setSelectedAmount(response.packages[0].coins);
        setSelectedPrice(response.packages[0].price);
      }
    } catch (error: any) {
      console.error("Error fetching coin packages:", error);
      showErrorToast(toast, error, "Gagal Memuat Paket Koin", "Terjadi kesalahan saat memuat paket koin");
    } finally {
      setLoadingPackages(false);
    }
  };

  const fetchPendingTransactions = async () => {
    if (!user) return;
    try {
      setLoadingPending(true);
      // Backend expects userId as numeric ID, but we'll use username for now
      // The backend will filter by userId field in transactions collection
      const response = await backend.payment.getUserTransactions({
        userId: user.name,
      });
      console.log("All transactions from backend:", response.transactions);
      
      // Filter hanya yang status pending dan belum expired
      const pending = response.transactions?.filter((tx: any) => {
        const isPayable = tx.isPayable === true;
        console.log(`Transaction ${tx.reference}: status=${tx.status}, isPayable=${isPayable}`);
        return isPayable;
      }) || [];
      console.log("Filtered pending transactions:", pending);
      setPendingTransactions(pending);
    } catch (error: any) {
      console.error("Error fetching pending transactions:", error);
      // Silently fail - pending transactions are optional
    } finally {
      setLoadingPending(false);
    }
  };


  const handleOpenPhoneModal = () => {
    setShowPhoneModal(true);
  };

  const handlePayPendingTransaction = (transaction: any) => {
    // Validasi: pastikan transaksi milik user yang login
    if (!user || transaction.username !== user.name) {
      toast({
        title: "Error",
        description: "Transaksi ini bukan milik Anda",
        variant: "destructive",
      });
      return;
    }

    // Validasi: pastikan transaksi belum expired
    const expiryTime = new Date(transaction.expiry_time || transaction.createdAt);
    if (expiryTime < new Date()) {
      toast({
        title: "Transaksi Expired",
        description: "Transaksi ini sudah kadaluarsa. Silakan buat transaksi baru.",
        variant: "destructive",
      });
      return;
    }

    if (window.snap) {
      console.log("Opening Midtrans SNAP for pending transaction:", transaction.snap_token);
      
      // Map payment method to Midtrans format
      let midtransPaymentMethod = transaction.payment_method.toLowerCase();
      if (midtransPaymentMethod === "qris") {
        midtransPaymentMethod = "other_qris";
      }
      
      // Open SNAP immediately without loading dialog
      window.snap.pay(transaction.snap_token, {
        enabledPayments: [midtransPaymentMethod],
        onSuccess: function(result: any) {
          console.log("Payment success:", result);
          toast({
            title: "Pembayaran Berhasil!",
            description: "Koin akan ditambahkan dalam beberapa saat",
          });
          setSnapToken(null);
          fetchPendingTransactions();
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        },
        onPending: function(result: any) {
          console.log("Payment pending:", result);
          toast({
            title: "Pembayaran Tertunda",
            description: "Silakan selesaikan pembayaran Anda",
          });
        },
        onError: function(result: any) {
          console.log("Payment error:", result);
          toast({
            title: "Pembayaran Gagal",
            description: "Terjadi kesalahan saat memproses pembayaran",
            variant: "destructive",
          });
        },
      });
    } else {
      toast({
        title: "Error",
        description: "Midtrans SNAP belum siap, silakan coba lagi",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPhone = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: "Nomor HP tidak valid",
        description: "Masukkan nomor HP yang valid (minimal 10 digit)",
        variant: "destructive",
      });
      return;
    }

    // Calculate fee
    setLoadingFee(true);
    try {
      const response = await backend.payment.calculateFee({
        code: selectedPaymentMethod,
        amount: selectedPrice,
      });
      setFeeData(response);
      setShowPhoneModal(false);
      setShowPaymentModal(true);
    } catch (error: any) {
      console.error("Error calculating fee:", error);
      toast({
        title: "Error",
        description: "Gagal menghitung biaya pembayaran",
        variant: "destructive",
      });
    } finally {
      setLoadingFee(false);
    }
  };

  const handlePayNow = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fallback to user.name if username is not available (for old cached users)
      const username = user.username || user.name;
      
      const response = await backend.payment.createPayment({
        userId: user.name,
        username: username,
        email: user.email || `${username}@vionyx.id`,
        phone: phoneNumber,
        coins: selectedAmount,
        paymentMethod: selectedPaymentMethod,
      });

      console.log("Payment response:", response);
      
      // Store snap token
      setSnapToken(response.snap_token);
      
      toast({
        title: "Transaksi berhasil dibuat!",
        description: "Membuka Midtrans SNAP...",
      });

      // Open Midtrans SNAP with retry logic
      const openSnap = () => {
        if (window.snap) {
          console.log("Opening Midtrans SNAP with token:", response.snap_token);
          // Close modal before opening SNAP
          setShowPaymentModal(false);
          
          window.snap.pay(response.snap_token, {
            onSuccess: function(result: any) {
              console.log("Payment success:", result);
              toast({
                title: "Pembayaran Berhasil!",
                description: "Koin akan ditambahkan dalam beberapa saat",
              });
              setSnapToken(null);
              setPhoneNumber("");
              // Redirect to dashboard after 2 seconds
              setTimeout(() => {
                navigate("/dashboard");
              }, 2000);
            },
            onPending: function(result: any) {
              console.log("Payment pending:", result);
              toast({
                title: "Pembayaran Tertunda",
                description: "Silakan selesaikan pembayaran Anda",
              });
            },
            onError: function(result: any) {
              console.log("Payment error:", result);
              toast({
                title: "Pembayaran Gagal",
                description: "Terjadi kesalahan saat memproses pembayaran",
                variant: "destructive",
              });
            },
            onClose: function() {
              console.log("Payment dialog closed by user");
            },
          });
        } else {
          console.error("window.snap is not available, retrying...");
          setTimeout(openSnap, 500);
        }
      };

      // Wait a bit for script to load, then open SNAP
      setTimeout(openSnap, 1000);
    } catch (error: any) {
      console.error("Error in handlePayNow:", error);
      showErrorToast(toast, error, "Gagal Membuat Transaksi", "Terjadi kesalahan saat membuat transaksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 md:py-8 mt-20 min-h-screen">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] mb-2">Top Up Koin</h1>
          <p className="text-[var(--foreground-muted)]">Isi ulang koin untuk membeli bot premium</p>
        </div>

        {/* Pending Transactions Section */}
        {!loadingPending && pendingTransactions.length > 0 && (
          <div className="clay-card-sm !bg-[rgba(234,179,8,0.06)] dark:!bg-[rgba(234,179,8,0.08)] !border-[rgba(234,179,8,0.25)] p-5 md:p-8 mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-6">Pembayaran Tertunda</h2>
            <div className="space-y-4">
              {pendingTransactions.map((tx) => (
                <div key={tx._id} className="clay-card-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="text-[var(--foreground)] font-semibold">{tx.coins} Koin</div>
                    <div className="text-[var(--foreground-muted)] text-sm mt-1">
                      Metode: <span className="text-[var(--accent)] font-semibold">{tx.payment_method}</span>
                    </div>
                    <div className="text-[var(--foreground-muted)] text-xs mt-2 space-y-1">
                      <div>Harga: {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(tx.amount)}</div>
                      <div>Admin: {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(tx.fee_customer)}</div>
                      <div className="text-[var(--foreground)] font-semibold">Total: {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(tx.total_amount)}</div>
                    </div>
                    <div className="text-[#B45309] dark:text-[#FCD34D] text-xs mt-2">
                      Kadaluarsa: {new Date(tx.expiry_time || tx.createdAt).toLocaleString("id-ID")}
                    </div>
                  </div>
                  <Button
                    onClick={() => handlePayPendingTransaction(tx)}
                    disabled={loadingSnapPayment}
                    className="!bg-[#EAB308] hover:!bg-[#CA8A04] !text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto sm:ml-4"
                  >
                    {loadingSnapPayment ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Membuka...
                      </>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className="clay-card p-5 md:p-8 mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] mb-6">Pilih Paket Koin</h2>
          {loadingPackages ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
              <span className="text-[var(--foreground-muted)]">Memuat paket koin...</span>
            </div>
          ) : coinPackages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {coinPackages.map((pkg) => (
                <Card
                  key={pkg._id}
                  onClick={() => {
                    setSelectedAmount(pkg.coins);
                    setSelectedPrice(pkg.price);
                  }}
                  className={`relative p-5 md:p-6 cursor-pointer transition-all duration-200 !rounded-[var(--radius-lg)] ${
                    selectedAmount === pkg.coins
                      ? "!bg-[var(--accent-glow)] !border-[var(--accent)] !shadow-[var(--shadow-accent)] scale-[1.02]"
                      : ""
                  }`}
                >
                  <div className="text-center">
                    <Coins className="h-8 w-8 mx-auto mb-2 text-[var(--accent)]" />
                    <div className="text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-1">{pkg.coins}</div>
                    <div className="text-[var(--foreground-muted)]">Koin</div>
                    <div className="text-sm text-[var(--accent)] mt-2">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(pkg.price)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center text-[var(--foreground-muted)] py-8">
              Tidak ada paket koin tersedia. Hubungi admin.
            </div>
          )}
        </div>


        <div className="text-center">
          <Button
            onClick={handleOpenPhoneModal}
            disabled={!selectedAmount || selectedAmount === 0}
            size="lg"
            className="px-10 md:px-12 text-base md:text-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Lanjutkan ke Pembayaran
          </Button>
        </div>
      </main>

      {/* Phone Number Modal */}
      <Dialog open={showPhoneModal} onOpenChange={setShowPhoneModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Masukkan Nomor HP</DialogTitle>
            <DialogDescription className="text-[var(--foreground-muted)]">
              Nomor HP diperlukan untuk verifikasi pembayaran
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[var(--foreground)]">
                Nomor HP <span className="text-[#EF4444]">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="081234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">
                Metode Pembayaran <span className="text-[#EF4444]">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Card
                  onClick={() => setSelectedPaymentMethod("QRIS")}
                  className={`p-4 cursor-pointer transition-all !rounded-[var(--radius)] ${
                    selectedPaymentMethod === "QRIS"
                      ? "!bg-[var(--accent-glow)] !border-[var(--accent)]"
                      : ""
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[var(--foreground)]">QRIS</div>
                    <div className="text-xs text-[var(--foreground-muted)] mt-1">Scan & Bayar</div>
                  </div>
                </Card>
                <Card
                  onClick={() => setSelectedPaymentMethod("GOPAY")}
                  className={`p-4 cursor-pointer transition-all !rounded-[var(--radius)] ${
                    selectedPaymentMethod === "GOPAY"
                      ? "!bg-[var(--accent-glow)] !border-[var(--accent)]"
                      : ""
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[var(--foreground)]">GOPAY</div>
                    <div className="text-xs text-[var(--foreground-muted)] mt-1">Dompet Digital</div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPhoneModal(false);
                  setPhoneNumber("");
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handleConfirmPhone}
                disabled={loadingFee || !phoneNumber || phoneNumber.length < 10}
                className="flex-1"
              >
                {loadingFee ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Lanjut...
                  </>
                ) : (
                  "Lanjut"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Konfirmasi Pembayaran</DialogTitle>
            <DialogDescription className="text-[var(--foreground-muted)]">
              Periksa detail akun dan pembayaran Anda
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* User Account Details */}
            <div className="clay-card-sm p-4 space-y-2">
              <div className="text-sm font-semibold text-[var(--accent)] mb-3">Detail Akun</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--foreground-muted)]">Username</span>
                <span className="text-[var(--foreground)]">{user?.username || user?.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--foreground-muted)]">Email</span>
                <span className="text-[var(--foreground)] text-xs">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--foreground-muted)]">Nomor HP</span>
                <span className="text-[var(--foreground)]">{phoneNumber}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="clay-card-sm p-4 space-y-2">
              <div className="text-sm font-semibold text-[var(--accent)] mb-3">Detail Pembayaran</div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--foreground-muted)]">Paket Koin</span>
                <span className="text-[var(--foreground)] font-semibold">{selectedAmount} Koin</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[var(--foreground-muted)]">Harga Paket</span>
                <span className="text-[var(--foreground)]">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(selectedPrice)}
                </span>
              </div>
              {feeData && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[var(--foreground-muted)]">Biaya Admin</span>
                    <span className="text-[var(--foreground)]">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(feeData.total_fee.customer)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                    <span className="text-[var(--accent)] font-semibold">Total Pembayaran</span>
                    <span className="text-[var(--accent)] font-bold text-lg">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(feeData.total_amount)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false);
                  setPhoneNumber("");
                  setFeeData(null);
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                onClick={handlePayNow}
                disabled={loading}
                className="flex-1 !bg-[#16A34A] hover:!bg-[#15803D]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Bayar Sekarang"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Dialog untuk SNAP Payment */}
      <Dialog open={loadingSnapPayment} onOpenChange={() => {}}>
        <DialogContent className="max-w-sm" onInteractOutside={(e) => e.preventDefault()}>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-12 w-12 animate-spin text-[var(--accent)] mb-4" />
            <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Membuka Pembayaran</h3>
            <p className="text-[var(--foreground-muted)] text-center text-sm">
              Silakan tunggu, Midtrans SNAP sedang dimuat...
            </p>
            <p className="text-[var(--foreground-muted)] text-xs mt-4">
              Jangan tutup halaman ini
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
