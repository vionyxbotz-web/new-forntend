import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, Save } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import backend from "~backend/client";
import { useQuery } from "@tanstack/react-query";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.name],
    queryFn: () => backend.user.getProfile({ userId: user!.name as any }),
    enabled: !!user?.name,
  });

  useEffect(() => {
    if (profile) {
      const profileData = profile as any;
      setName(profileData.name || user?.name || "");
      setEmail(profileData.email || `${user?.name}@example.com` || "");
    }
  }, [profile, user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Only allow password updates
    if (!password) {
      toast({
        title: "Tidak ada perubahan",
        description: "Masukkan password baru untuk mengupdate profil",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await backend.user.updateProfile({
        userId: user.name as any,
        password: password,
      });

      toast({
        title: "Password berhasil diperbarui!",
        description: "Password akun Anda telah diupdate",
      });

      setPassword("");
    } catch (error: any) {
      console.error(error);
      toast({
        title: getErrorTitle(error, "Update gagal"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-6 md:py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] mb-2">Profil Saya</h1>
          <p className="text-[var(--foreground-muted)]">Kelola informasi akun Anda</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="clay-card-raised p-6 md:p-8"
        >
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[var(--foreground)]">
                Nama Lengkap (Tidak dapat diubah)
              </Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                <Input
                  id="name"
                  type="text"
                  value={name}
                  readOnly
                  disabled
                  className="pl-10 !cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--foreground)]">
                Email (Tidak dapat diubah)
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  disabled
                  className="pl-10 !cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--foreground)]">
                Password Baru (Opsional)
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--foreground-subtle)] pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !password}
              className="w-full"
              size="lg"
            >
              {loading ? (
                "Menyimpan..."
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Update Password
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-[var(--foreground-muted)]">Role</div>
                <div className="text-[var(--foreground)] font-semibold capitalize">{(profile as any)?.role || "user"}</div>
              </div>
              <div>
                <div className="text-[var(--foreground-muted)]">Saldo Koin</div>
                <div className="text-[var(--accent)] font-semibold">{(profile as any)?.coins || 0} Koin</div>
              </div>
              <div className="col-span-2">
                <div className="text-[var(--foreground-muted)]">Bergabung Sejak</div>
                <div className="text-[var(--foreground)] font-semibold">
                  {(profile as any)?.createdAt
                    ? new Date((profile as any).createdAt).toLocaleDateString("id-ID")
                    : "-"}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
