import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, CheckCircle, AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import backend from "~backend/client";
import FuzzyCaptcha from "@/components/FuzzyCaptcha";
import { showErrorToast } from "@/lib/errorHandler";
import { getErrorMessage } from "@/lib/errorHandler";

type RegistrationStep = "email" | "otp" | "password" | "success";

export default function Register() {
  const [step, setStep] = useState<RegistrationStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<{ available: boolean; message: string } | null>(null);
  const [checkingName, setCheckingName] = useState(false);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [userId, setUserId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Check name/username availability with debounce and abort
  const handleNameChange = (value: string) => {
    setName(value);
    
    if (!value.trim()) {
      setNameStatus(null);
      return;
    }

    // Validate format immediately (3-20 chars, alphanumeric, underscore, dash)
    const nameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!nameRegex.test(value)) {
      setNameStatus({
        available: false,
        message: "Username harus 3-20 karakter, hanya huruf, angka, underscore, dan dash"
      });
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    // Format valid, now check availability with debounce
    setCheckingName(true);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Debounce: wait 500ms before checking
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        // Create new abort controller for this request
        abortControllerRef.current = new AbortController();
        
        const result = await backend.auth.checkUsername({ username: value });
        
        // Only update state if request wasn't aborted
        if (!abortControllerRef.current.signal.aborted) {
          setNameStatus(result);
        }
      } catch (err: any) {
        // Ignore abort errors
        if (err.name === "AbortError") {
          return;
        }
        
        setNameStatus({
          available: false,
          message: err.message || "Gagal cek username"
        });
      } finally {
        setCheckingName(false);
      }
    }, 500);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Format email tidak valid");
      }

      if (!name.trim()) {
        throw new Error("Nama/Username harus diisi");
      }

      if (!nameStatus?.available) {
        throw new Error(nameStatus?.message || "Nama/Username tidak tersedia");
      }

      await backend.auth.requestOtp({ email, name });
      setStep("otp");
      setOtpTimer(300); // 5 minutes
      toast({
        title: "OTP terkirim",
        description: `Kode OTP telah dikirim ke ${email}`,
      });
    } catch (err: any) {
      const msg = getErrorMessage(err) || "Gagal mengirim OTP";
      setError(msg);
      showErrorToast(toast, err, "Gagal Mengirim OTP", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        throw new Error("OTP harus berupa 6 digit angka");
      }

      await backend.auth.verifyOtp({ email, otp });
      setStep("password");
      toast({
        title: "Email terverifikasi",
        description: "Silakan buat password Anda",
      });
    } catch (err: any) {
      const msg = getErrorMessage(err) || "OTP tidak valid";
      setError(msg);
      showErrorToast(toast, err, "Verifikasi OTP Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!captchaToken) {
        throw new Error("Captcha diperlukan");
      }

      if (password.length < 8) {
        throw new Error("Password minimal 8 karakter");
      }

      if (password !== confirmPassword) {
        throw new Error("Password tidak cocok");
      }

      const response = await backend.auth.register({
        email,
        name,
        password,
        otp,
        captchaToken,
      });

      setUserId(response.id);
      setStep("success");
      toast({
        title: "Registrasi berhasil!",
        description: "Akun Anda telah dibuat. Silakan login.",
      });
    } catch (err: any) {
      const msg = getErrorMessage(err) || "Pendaftaran gagal";
      setError(msg);
      showErrorToast(toast, err, "Registrasi Gagal", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      await backend.auth.requestOtp({ email, name });
      setOtpTimer(300);
      setOtp("");
      toast({
        title: "OTP dikirim ulang",
        description: `Kode OTP baru telah dikirim ke ${email}`,
      });
    } catch (err: any) {
      const msg = getErrorMessage(err) || "Gagal mengirim ulang OTP";
      setError(msg);
      showErrorToast(toast, err, "Gagal Mengirim Ulang OTP", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="clay-card-raised p-6 md:p-9">
          <div className="text-center mb-7">
            <Link to="/">
              <h1 className="text-3xl font-bold text-[var(--accent)] mb-2">
                Vionyx
              </h1>
            </Link>
            <p className="text-[var(--foreground-muted)] text-sm">Buat akun baru Anda</p>
          </div>

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div className="text-sm text-[var(--accent)] mb-4">Langkah 1 dari 3: Email & Username</div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Username (Nama Lengkap)
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="johndoe"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
                {checkingName && (
                  <p className="text-xs text-[var(--foreground-muted)]">Mengecek ketersediaan...</p>
                )}
                {nameStatus && !checkingName && (
                  <p className={`text-xs ${nameStatus.available ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
                    {nameStatus.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 clay-badge-danger !rounded-[var(--radius)] !inline-flex w-full">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  "Kirim OTP"
                )}
              </Button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="text-sm text-[var(--accent)] mb-4">Langkah 2 dari 3: Verifikasi OTP</div>

              <div className="clay-card-sm p-4 text-sm text-[var(--accent)] bg-[var(--accent-glow)]">
                Kode OTP telah dikirim ke <strong>{email}</strong>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">
                  Kode OTP (6 digit)
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                  required
                />
              </div>

              <div className="text-center text-sm">
                {otpTimer > 0 ? (
                  <p className="text-[var(--foreground-muted)]">
                    Berlaku dalam <strong className="text-[var(--accent)]">{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, "0")}</strong>
                  </p>
                ) : (
                  <p className="text-[#EF4444]">OTP telah kadaluarsa</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 clay-badge-danger !rounded-[var(--radius)] !inline-flex w-full">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Verifikasi...
                  </span>
                ) : (
                  "Verifikasi OTP"
                )}
              </Button>

              <Button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || otpTimer > 0}
                variant="outline"
                className="w-full"
              >
                Kirim Ulang OTP
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError("");
                }}
                variant="ghost"
                className="w-full"
              >
                Kembali
              </Button>
            </form>
          )}

          {/* Step 3: Password */}
          {step === "password" && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="text-sm text-[var(--accent)] mb-4">Langkah 3 dari 3: Buat Password</div>

              <div className="flex items-center gap-2 p-3 clay-badge-success !rounded-[var(--radius)] !inline-flex w-full">
                <CheckCircle size={16} />
                <span>Email berhasil diverifikasi</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <FuzzyCaptcha
                  onSuccess={(token) => setCaptchaToken(token)}
                  onFail={() => {
                    setCaptchaToken(null);
                    toast({
                      title: "Captcha gagal",
                      description: "Silakan coba lagi",
                      variant: "destructive",
                    });
                  }}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 clay-badge-danger !rounded-[var(--radius)] !inline-flex w-full">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    Mendaftar...
                  </span>
                ) : (
                  "Selesaikan Pendaftaran"
                )}
              </Button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[rgba(34,197,94,0.12)] rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-[#16A34A]" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">Pendaftaran Berhasil!</h2>
                <p className="text-[var(--foreground-muted)]">Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.</p>
              </div>

              <div className="clay-card-sm p-4 text-left space-y-2">
                <p className="text-sm text-[var(--foreground-muted)]">
                  <strong className="text-[var(--accent)]">Email:</strong> {email}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  <strong className="text-[var(--accent)]">User ID:</strong> {userId}
                </p>
              </div>

              <Button
                onClick={() => navigate("/login")}
                className="w-full"
                size="lg"
              >
                Ke Halaman Login
              </Button>
            </div>
          )}

          {step !== "success" && (
            <div className="mt-6 text-center text-sm">
              <span className="text-[var(--foreground-muted)]">Sudah punya akun? </span>
              <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-light)] font-semibold">
                Masuk sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
