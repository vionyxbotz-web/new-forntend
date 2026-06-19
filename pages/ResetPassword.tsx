import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Pastikan password dan konfirmasi password sama",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await backend.auth.resetPassword({ email, newPassword });
      toast({
        title: "Password berhasil direset!",
        description: "Silakan login dengan password baru Anda",
      });
      navigate("/login");
    } catch (error: any) {
      console.error(error);
      toast({
        title: getErrorTitle(error, "Reset password gagal"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className={`clay-card p-8 shadow-2xl shadow-[var(--shadow-accent)]`}>
          <div className="text-center mb-8">
            <Link to="/">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent mb-2">
                Vionyx
              </h1>
            </Link>
            <p className="text-[var(--foreground-muted)]">Reset password akun Anda</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--foreground)]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`pl-10 bg-[var(--surface)] border-[var(--accent-border)] focus:border-[var(--accent)] text-[var(--foreground)]`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-[var(--foreground)]">
                Password Baru
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className={`pl-10 bg-[var(--surface)] border-[var(--accent-border)] focus:border-[var(--accent)] text-[var(--foreground)]`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[var(--foreground)]">
                Konfirmasi Password Baru
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--foreground-muted)]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`pl-10 bg-[var(--surface)] border-[var(--accent-border)] focus:border-[var(--accent)] text-[var(--foreground)]`}
                />
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
                  <KeyRound className="mr-2 h-5 w-5" />
                  Reset Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[var(--foreground-muted)]">Ingat password Anda?{" "}</span>
            <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-light)] font-semibold">
              Masuk sekarang
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
