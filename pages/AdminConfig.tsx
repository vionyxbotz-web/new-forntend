import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Server, AlertCircle, CheckCircle, Settings } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

export default function AdminConfig() {
  const { toast } = useToast();
  const [jadibotUrl, setJadibotUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoadingConfig(true);
      const config = await backend.admin.getConfig();
      setJadibotUrl(config.jadibotUrl);
    } catch (error: any) {
      console.error("Error loading config:", error);
      toast({
        title: "Error",
        description: "Gagal memuat konfigurasi",
        variant: "destructive",
      });
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Trim whitespace from URL
      const cleanUrl = jadibotUrl.trim();

      // Validate URL
      if (!cleanUrl || !cleanUrl.startsWith("http")) {
        toast({
          title: "Error",
          description: "URL harus dimulai dengan http:// atau https://",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await backend.admin.updateConfig({
        jadibotUrl: cleanUrl,
      });

      if (response.success) {
        toast({
          title: "Berhasil!",
          description: "Konfigurasi berhasil disimpan",
        });
      }
    } catch (error: any) {
      console.error("Error saving config:", error);
      toast({
        title: getErrorTitle(error, "Gagal menyimpan"),
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

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6 md:py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-2xl md:text-4xl font-bold text-[var(--foreground)]">Konfigurasi Sistem</h1>
          </div>
          <p className="text-[var(--foreground-muted)]">Kelola konfigurasi platform Vionyx</p>
        </motion.div>

        {/* Jadibot Service Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-5 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-[var(--accent-glow)] border border-[var(--accent-border)] rounded-[var(--radius)] flex items-center justify-center">
                <Server className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">Jadibot Service URL</h2>
                <p className="text-sm text-[var(--foreground-muted)]">URL server jadibot WhatsApp</p>
              </div>
            </div>

            {loadingConfig ? (
              <div className="py-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
                <p className="text-[var(--foreground-muted)] mt-3">Memuat konfigurasi...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jadibotUrl" className="text-[var(--foreground)]">
                    Service URL <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    id="jadibotUrl"
                    type="url"
                    placeholder="http://your-server-ip:3000"
                    value={jadibotUrl}
                    onChange={(e) => setJadibotUrl(e.target.value.trim())}
                    className=""
                  />
                  <p className="text-xs text-[var(--foreground-muted)]">
                    URL lengkap server jadibot (contoh: http://192.168.1.100:3000)
                  </p>
                </div>

                {/* Info Box */}
                <div className="clay-card-sm !bg-[var(--accent-glow)] p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-[var(--foreground-muted)]">
                    <p className="font-semibold text-[var(--accent)] mb-1">Informasi Penting:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>URL harus dapat diakses dari server backend</li>
                      <li>Gunakan format: http://IP:PORT atau https://domain</li>
                      <li>Perubahan akan langsung diterapkan setelah disimpan</li>
                      <li>Pastikan service jadibot sudah berjalan di URL tersebut</li>
                    </ul>
                  </div>
                </div>

                {/* Current Config Display */}
                <div className={`clay-card-sm p-4 ${jadibotUrl ? '' : '!bg-[rgba(239,68,68,0.06)] !border-[rgba(239,68,68,0.20)]'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {jadibotUrl ? (
                      <CheckCircle className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className={`text-sm font-semibold ${jadibotUrl ? 'text-[var(--accent)]' : 'text-[#EF4444]'}`}>
                        {jadibotUrl ? 'URL Saat Ini:' : 'URL Belum Dikonfigurasi'}
                      </p>
                      <p className="text-[var(--foreground)] font-mono text-sm break-all">
                        {jadibotUrl || 'Silakan masukkan URL Jadibot Service'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={loading || !jadibotUrl}
                    className=""
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Simpan Konfigurasi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-[#EAB308] flex-shrink-0" />
              <div className="text-sm text-[var(--foreground-muted)]">
                <p className="font-semibold text-[#EAB308] mb-1">Catatan Keamanan:</p>
                <p>
                  Pastikan hanya admin yang memiliki akses ke halaman ini. Perubahan konfigurasi
                  yang salah dapat menyebabkan bot tidak dapat terhubung.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
