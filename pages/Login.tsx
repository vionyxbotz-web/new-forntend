import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import backend from "~backend/client";
import FuzzyCaptcha from "@/components/FuzzyCaptcha";
import { showErrorToast } from "@/lib/errorHandler";

export default function Login() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState(""); // ✅ Username untuk login cepat
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      toast({
        title: "Captcha diperlukan",
        description: "Silakan selesaikan verifikasi captcha",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await backend.auth.login({
        email,
        password,
        captchaToken,
        username: username.trim() || undefined,
      });
      login(
        {
          id: response.id,
          email: response.email,
          username: response.username,
          name: response.name,
          phone: response.phone,
          role: response.role,
          coins: response.coins,
          avatar: response.avatar,
        },
        response.token
      );

      toast({
        title: "Login berhasil!",
        description: "Selamat datang kembali di Vionyx",
      });

      if (response.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      showErrorToast(toast, error, "Login Gagal", "Email atau password salah");
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
            <p className="text-[var(--foreground-muted)] text-sm">Masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">
                Username <span className="text-xs text-[var(--accent)] font-normal">⚡ Login Instan</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Contoh: Alexander, Afox, dll"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-[var(--foreground-subtle)]">
                Isi username untuk login super cepat, atau kosongkan untuk login dengan email
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>

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

            <div className="flex items-center justify-between text-sm">
              <Link to="/reset-password" className="text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors font-medium">
                Lupa password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                "Memproses..."
              ) : (
                <>
                  <LogIn className="mr-1.5 h-5 w-5" />
                  Masuk
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--foreground-muted)]">Belum punya akun? </span>
            <Link to="/register" className="text-[var(--accent)] hover:text-[var(--accent-light)] font-semibold transition-colors">
              Daftar sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
