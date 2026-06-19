import { useState, useEffect, memo } from "react";
import { X, Link as LinkIcon, Shield, Copy, Check, Smartphone, QrCode, Clock, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import backend from "~backend/client";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";
import { getStoredToken } from "@/lib/apiClient";

interface ConnectBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  balance?: { coins: number };
}

type ConnectionState = 'input' | 'connecting' | 'qr' | 'pairing' | 'success' | 'error';

const ConnectBotModal = memo(function ConnectBotModal({ isOpen, onClose, onSuccess, balance }: ConnectBotModalProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [connectionState, setConnectionState] = useState<ConnectionState>('input');
  const [result, setResult] = useState<{ pairingCode?: string | null; qr?: string | null; sessionPath?: string | null } | null>(null);
  const [existingBots, setExistingBots] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Dummy rate limit object (no actual limiting)
  const rateLimit = {
    canAttempt: true,
    attemptAction: () => true,
    remainingAttempts: Infinity,
    timeUntilReset: 0,
    timeLeft: 0,
    isBlocked: false,
    reset: () => {},
    currentAttempts: 0
  };

  // Countdown timer for connection states
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (connectionState === 'connecting') {
      setCountdown(30); // 30 seconds to connect
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setConnectionState('error');
            toast({
              title: "Koneksi Timeout",
              description: "Waktu koneksi habis. Silakan coba lagi.",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionState, toast]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setPhoneNumber("");
      setResult(null);
      setConnectionState('input');
      setCountdown(0);
      setCopiedCode(null);
    }
  }, [isOpen]);

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(type);
      toast({
        title: "Berhasil Disalin",
        description: `${type} telah disalin ke clipboard`,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      toast({
        title: "Gagal Menyalin",
        description: "Tidak dapat mengakses clipboard",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    
    // Validate phone number format
    if (cleanPhone.startsWith('08') || cleanPhone.startsWith('0')) {
      toast({
        title: "Format Nomor Tidak Valid",
        description: "Gunakan kode negara internasional. Contoh: 62812xxxx (Indonesia), 60199xxxx (Malaysia), 1202xxxx (USA). Jangan pakai 08xxx.",
        variant: "destructive",
      });
      return;
    }

    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      toast({
        title: "Format Nomor Tidak Valid",
        description: "Nomor harus 10-15 digit dengan kode negara.",
        variant: "destructive",
      });
      return;
    }

    if (!/^[0-9]+$/.test(cleanPhone)) {
      toast({
        title: "Format Nomor Tidak Valid",
        description: "Nomor hanya boleh berisi angka.",
        variant: "destructive",
      });
      return;
    }

    setConnectionState('connecting');

    try {
      const base = (import.meta.env.VITE_CLIENT_TARGET as string) || ("http://localhost:4000");
      const target = `${base.replace(/\/$/, "")}/jadibot/create`;
      
      // Prepare headers with Authorization
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      
      const effectiveToken = token || getStoredToken();
      if (effectiveToken) {
        headers["Authorization"] = `Bearer ${effectiveToken}`;
      }
      
      const raw = await fetch(target, {
        method: "POST",
        headers,
        body: JSON.stringify({ username: user.username, phoneNumber: cleanPhone }),
      });

      if (!raw.ok) {
        const errorData = await raw.json().catch(() => ({ error: "Unknown error" }));
        console.warn("[CONNECT BOT] Request failed", {
          status: raw.status,
          code: errorData?.code,
          hasContextToken: !!token,
          hasStoredToken: !!getStoredToken(),
        });
        
        // Handle specific error codes
        if (raw.status === 429) {
          if (errorData.code === 'ACCOUNT_BLOCKED') {
            throw new Error(`⚠️ Akun Anda diblokir hingga ${new Date(errorData.blockedUntil).toLocaleString('id-ID')} karena terlalu banyak percobaan create bot. Silakan tunggu atau hubungi admin.`);
          } else if (errorData.code === 'USER_RATE_LIMIT_EXCEEDED') {
            const minutes = Math.ceil(errorData.retryAfter / 60);
            throw new Error(`⚠️ Batas maksimal 3 bot per jam tercapai. Tunggu ${minutes} menit lagi.`);
          }
          throw new Error(`⚠️ Terlalu banyak permintaan. Tunggu beberapa saat.`);
        } else if (raw.status === 401) {
          throw new Error(`🔐 Sesi Anda expired. Silakan refresh halaman. Jika masih gagal, login ulang.`);
        } else if (raw.status === 403) {
          if (errorData.code === 'USERNAME_MISMATCH') {
            throw new Error(`⚠️ Username tidak sesuai dengan akun yang login.`);
          }
          throw new Error(`⚠️ Anda tidak memiliki akses untuk operasi ini.`);
        } else if (raw.status === 400) {
          if (errorData.code === 'INVALID_PHONE_FORMAT') {
            throw new Error(`⚠️ Format nomor tidak valid. Gunakan kode negara (contoh: 62812xxxx).`);
          }
          throw new Error(errorData.error || "Input tidak valid");
        }
        
        throw new Error(errorData.error || `Server error (${raw.status})`);
      }

      const resp = await raw.json();
      setResult(resp.data || null);

      if (resp.data?.qr) {
        setConnectionState('qr');
      } else if (resp.data?.pairingCode) {
        setConnectionState('pairing');
      } else {
        setConnectionState('success');
      }

      toast({
        title: "Berhasil menyambungkan bot",
        description: "Bot sedang dalam proses koneksi...",
      });
      onSuccess();
    } catch (error: any) {
      console.error(error);
      setConnectionState('error');
      
      // Use error handler untuk message yang user-friendly
      const errorTitle = getErrorTitle(error, "Gagal Menyambungkan Bot");
      const errorMessage = getErrorMessage(error);
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const renderConnectionState = () => {
    switch (connectionState) {
      case 'connecting':
        return (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg shadow-[var(--shadow-accent)] animate-pulse">
                <Wifi className="h-10 w-10 text-[var(--foreground)]" />
              </div>
              <div className="absolute inset-0 bg-[var(--accent)] rounded-full animate-ping opacity-30"></div>
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">Menghubungkan Bot...</h3>
              <p className="text-[var(--foreground-muted)]">Menunggu respons dari server Jadibot</p>
              <div className="flex items-center justify-center gap-2 text-[var(--accent)]">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-lg">{countdown}s</span>
              </div>
            </div>

            <div className="w-full bg-[var(--surface-raised)] rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>
          </div>
        );

      case 'qr':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <QrCode className="h-8 w-8 text-[var(--accent)] mr-3" />
                <h3 className="text-xl font-semibold text-[var(--foreground)]">Scan QR Code</h3>
              </div>
              <p className="text-[var(--foreground-muted)]">Buka WhatsApp → Linked Devices → Link a Device</p>
            </div>

            {result?.qr && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-2xl">
                  <img
                    src={result.qr}
                    alt="QR code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            )}

            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Pastikan WiFi/mobile data aktif</span>
              </div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                QR Code akan berlaku selama 60 detik
              </p>
            </div>
          </div>
        );

      case 'pairing':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-[var(--accent)] mr-2" />
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Pairing Code</h3>
              </div>
              <p className="text-sm text-[var(--foreground-muted)]">Masukkan kode ini di WhatsApp</p>
            </div>

            {result?.pairingCode && (
              <div className="bg-[var(--surface-raised)] border border-[var(--accent-border)] rounded-lg p-4 text-center">
                <div className="font-mono text-2xl text-[var(--accent)] mb-3 tracking-wider">
                  {result.pairingCode}
                </div>
                <Button
                  onClick={() => copyToClipboard(result.pairingCode!, 'Pairing Code')}
                  variant="outline"
                  size="sm"
                  className="border-[var(--accent-border)] text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                >
                  {copiedCode === 'pairing' ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Disalin!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Salin Kode
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="text-center space-y-2">
              <div className="text-xs text-[var(--foreground-muted)]">
                <strong>Cara menyambung:</strong>
              </div>
              <div className="space-y-1.5 text-left bg-[var(--surface-raised)] rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <p className="text-xs text-[var(--foreground-muted)]">Buka WhatsApp Yang mau di jadikan bot.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <p className="text-xs text-[var(--foreground-muted)]">Klik titik tiga (⋮) di pojok kanan atas.</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <p className="text-xs text-[var(--foreground-muted)]">Pilih <strong>Perangkat tertaut</strong> (Linked devices).</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <p className="text-xs text-[var(--foreground-muted)]">Klik tombol <strong>Tautkan perangkat</strong> (Link a device).</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-full flex items-center justify-center text-xs font-bold">5</span>
                  <p className="text-xs text-[var(--foreground-muted)]">Lalu pilih <strong>Tautkan dengan kode ponsel</strong> (Link with phone number instead).</p>
                </div>
              </div>
              <div className="mt-3 p-2.5 bg-[var(--accent-glow)] border border-[var(--accent-border)] rounded-lg">
                <p className="text-xs text-[var(--foreground-muted)] mb-1.5">
                  💬 Mau tanya-tanya atau request fitur?
                </p>
                <a
                  href="https://chat.whatsapp.com/CZArnIjCrp49mwJ1Bwq59M?mode=wwc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[var(--accent)] hover:text-[var(--accent-light)] underline break-all"
                >
                  Gabung ke Grup WhatsApp
                </a>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-[var(--foreground)]">Berhasil Tersambung!</h3>
              <p className="text-[var(--foreground-muted)]">Bot Anda sudah aktif dan siap digunakan</p>
            </div>

            {result?.sessionPath && (
              <div className="bg-[var(--surface-raised)] border border-[var(--accent-border)] rounded-lg p-4">
                <div className="text-sm text-[var(--foreground-muted)] mb-2">Session ID:</div>
                <div className="font-mono text-[var(--accent)] text-sm break-all">{result.sessionPath}</div>
              </div>
            )}
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <X className="h-8 w-8 text-red-400" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-red-400">Koneksi Gagal</h3>
              <p className="text-[var(--foreground-muted)]">Terjadi kesalahan saat menyambungkan bot</p>
            </div>

            <Button
              onClick={() => setConnectionState('input')}
              variant="outline"
              className="border-[var(--accent-border)] text-[var(--accent)] hover:bg-[var(--accent-glow)]"
            >
              Coba Lagi
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-[var(--surface)]  z-50"
          />
          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md max-h-[90vh] overflow-y-auto bg-[var(--surface)] border border-[var(--accent-border)] rounded-2xl p-4 sm:p-6 md:p-8 z-50 shadow-2xl shadow-[var(--shadow-accent)]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className={connectionState === 'connecting' ? 'animate-spin' : ''}>
                  <LinkIcon className={`h-6 w-6 ${connectionState === 'connecting' ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'}`} />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  {connectionState === 'connecting' ? 'Menghubungkan...' :
                   connectionState === 'qr' ? 'Scan QR Code' :
                   connectionState === 'pairing' ? 'Pairing Code' :
                   connectionState === 'success' ? 'Berhasil!' :
                   connectionState === 'error' ? 'Gagal' : 'Sambungkan Bot'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>


            {connectionState === 'input' ? (
              <form onSubmit={handleConnect} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[var(--foreground-muted)]">Username</Label>
                  <Input value={user?.name || ""} disabled className="bg-[var(--surface)] border-[var(--accent-border)] text-[var(--foreground)]" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[var(--foreground-muted)]">
                    Nomor WhatsApp (dengan Kode Negara)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="62812xxxx (ID), 60199xxxx (MY), 1202xxxx (US)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    className="bg-[var(--surface)] border-[var(--accent-border)] focus:border-[var(--accent)] text-[var(--foreground)]"
                  />
                  <div className="space-y-2">
                    <p className="text-xs text-red-400 font-medium flex items-start gap-2">
                      <span className="text-base">⚠️</span>
                      <span>Minimal saldo 1 koin. Koin berkurang setiap 5 menit sesuai jumlah grup bot.</span>
                    </p>
                    <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs text-yellow-300 font-semibold mb-1">⚠️ RISIKO BANNED WhatsApp:</p>
                      <ul className="text-xs text-yellow-200 space-y-1 list-disc list-inside">
                        <li><strong>Nomor Baru:</strong> Risiko TINGGI banned jika langsung di-bot</li>
                        <li><strong>Nomor Aktif (3+ bulan):</strong> Risiko lebih rendah</li>
                        <li><strong>Nomor Bisnis/WA Business:</strong> Risiko SANGAT TINGGI</li>
                        <li><strong>Rekomendasi:</strong> Gunakan nomor backup, BUKAN nomor utama</li>
                      </ul>
                    </div>
                  </div>
                  {existingBots.length > 0 && (
                    <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-400 font-medium mb-2">
                        📱 Bot Jadibot yang sudah terdaftar:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {existingBots.map((bot, index) => (
                          <span key={index} className="px-2 py-1 bg-[var(--accent-glow)] text-[var(--accent-light)] rounded text-xs font-mono">
                            {(bot as any).phoneNumber || bot.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={connectionState === 'connecting' || (balance?.coins || 0) < 1}
                  className={`w-full font-semibold py-6 rounded-lg shadow-lg transition-all duration-300 ${
                    (balance?.coins || 0) < 1
                      ? "bg-[var(--border-strong)] hover:bg-[var(--surface-raised)] text-[var(--foreground-muted)] shadow-[var(--border)] cursor-not-allowed"
                      : "text-[var(--foreground)] shadow-[var(--shadow-accent)]"
                  }`}
                >
                  {connectionState === 'connecting' ? (
                    "Menyambungkan..."
                  ) : (balance?.coins || 0) < 1 ? (
                    "Saldo Tidak Mencukupi"
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-5 w-5" />
                      Sambungkan Bot
                    </>
                  )}
                </Button>
              </form>
            ) : (
              renderConnectionState()
            )}
          </div>
        </>
      )}
    </>
  );
});

export default ConnectBotModal;
