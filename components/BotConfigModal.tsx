import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast, { ToastType } from "./Toast";

interface BotConfig {
  mods: string[];
  wm: string;
  author: string;
  packname: string;
  namebot: string;
}

interface BotConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUsername?: string; // Optional: for admin to edit other user's config
}

export default function BotConfigModal({ isOpen, onClose, targetUsername }: BotConfigModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [config, setConfig] = useState<BotConfig>({
    mods: [],
    wm: "",
    author: "",
    packname: "",
    namebot: "",
  });
  const [modsInput, setModsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false); // Track saving state
  const [toast, setToast] = useState<{ message: string; type: ToastType; isOpen: boolean }>({
    message: "",
    type: "success",
    isOpen: false,
  });

  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';

  // Use targetUsername for admin, or user?.name for regular user
  const username = targetUsername || user?.name;

  // Fetch current config
  const { data: configData, isLoading } = useQuery({
    queryKey: ["botConfig", username],
    queryFn: async () => {
      if (!username) throw new Error("No username available");
      const response = await fetch(`${baseUrl}/user/config/${encodeURIComponent(username)}`);
      if (!response.ok) throw new Error("Failed to fetch config");
      return response.json();
    },
    enabled: !!user && isOpen,
  });

  // Update config when data is loaded
  useEffect(() => {
    if (configData?.config) {
      setConfig(configData.config);
      setModsInput(configData.config.mods.join(", "));
    }
  }, [configData]);

  // Reset toast when modal closes
  useEffect(() => {
    if (!isOpen) {
      setToast({ message: "", type: "success", isOpen: false });
      setIsSaving(false); // Reset saving state
      // Clear timeout when modal closes
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Save config mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: BotConfig) => {
      const response = await fetch(`${baseUrl}/user/config/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username!,
          config: newConfig,
        }),
      });
      if (!response.ok) throw new Error("Failed to update config");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["botConfig", username] });
      
      // Keep button disabled
      setIsSaving(true);
      
      // Clear previous timeout if exists
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      
      setToast({
        message: "✅ Config berhasil disimpan!\n🔄 Bot Anda akan reload otomatis untuk menerapkan config baru.",
        type: "success",
        isOpen: true,
      });
      
      // Auto-close modal after 1 second (faster)
      closeTimeoutRef.current = setTimeout(() => {
        onClose();
        closeTimeoutRef.current = null;
      }, 1000);
    },
    onError: (error) => {
      console.error("Error saving config:", error);
      setIsSaving(false); // Reset saving state on error
      setToast({
        message: "❌ Gagal menyimpan config. Silakan coba lagi.",
        type: "error",
        isOpen: true,
      });
    },
  });

  const handleSave = () => {
    // Prevent double-click or re-click after success
    if (saveConfigMutation.isPending || isSaving) return;
    
    setIsSaving(true); // Set saving state immediately
    
    // Parse mods from comma-separated string
    const modsArray = modsInput
      .split(",")
      .map((m) => m.trim())
      .filter((m) => m !== "");

    const updatedConfig = {
      ...config,
      mods: modsArray,
    };

    saveConfigMutation.mutate(updatedConfig);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[var(--surface)]  z-50 flex items-center justify-center p-4"
            onClick={(saveConfigMutation.isPending || isSaving) ? undefined : onClose}
          >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[var(--surface-raised)]  rounded-2xl p-3 sm:p-4 md:p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto border border-[var(--border)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[var(--accent-glow)] rounded-lg">
                  <Settings className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Konfigurasi Bot{targetUsername ? ` - ${targetUsername}` : ''}
                </h2>
              </div>
              <button
                onClick={onClose}
                disabled={saveConfigMutation.isPending || isSaving}
                className="p-1.5 hover:bg-[var(--surface-raised)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 text-[var(--foreground-muted)]" />
              </button>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mods */}
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                    Moderator Numbers
                    <span className="text-[var(--foreground-subtle)] ml-1 text-xs">(pisahkan dengan koma)</span>
                  </label>
                  <input
                    type="text"
                    value={modsInput}
                    onChange={(e) => setModsInput(e.target.value)}
                    placeholder="628123456789, 60199971698"
                    className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Watermark */}
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                    Watermark (WM)
                  </label>
                  <input
                    type="text"
                    value={config.wm}
                    onChange={(e) => setConfig({ ...config, wm: e.target.value })}
                    placeholder="© My Bot, Since 2025"
                    className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                    Author (Pembuat Sticker)
                  </label>
                  <input
                    type="text"
                    value={config.author}
                    onChange={(e) => setConfig({ ...config, author: e.target.value })}
                    placeholder="My Bot ©2025"
                    className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Packname */}
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                    Pack Name (Nama Pack Sticker)
                  </label>
                  <input
                    type="text"
                    value={config.packname}
                    onChange={(e) => setConfig({ ...config, packname: e.target.value })}
                    placeholder="© My Bot, Since 2025"
                    className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Namebot */}
                <div>
                  <label className="block text-xs font-medium text-[var(--foreground-muted)] mb-1.5">
                    Nama Bot
                  </label>
                  <input
                    type="text"
                    value={config.namebot}
                    onChange={(e) => setConfig({ ...config, namebot: e.target.value })}
                    placeholder="My Awesome Bot"
                    className="w-full px-3 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder-[var(--foreground-subtle)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                {/* Preview */}
                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3">
                  <h3 className="text-xs font-medium text-[var(--foreground-muted)] mb-2">Preview Config:</h3>
                  <div className="space-y-1 text-xs text-[var(--foreground-muted)] font-mono">
                    <div className="break-all">
                      <span className="text-[var(--foreground-subtle)]">global.mods =</span>{" "}
                      [{modsInput.split(",").map((m) => m.trim()).filter((m) => m !== "").map((m) => `"${m}"`).join(", ")}]
                    </div>
                    <div className="break-all">
                      <span className="text-[var(--foreground-subtle)]">global.wm =</span> "{config.wm}"
                    </div>
                    <div className="break-all">
                      <span className="text-[var(--foreground-subtle)]">global.author =</span> "{config.author}"
                    </div>
                    <div className="break-all">
                      <span className="text-[var(--foreground-subtle)]">global.packname =</span> "{config.packname}"
                    </div>
                    <div className="break-all">
                      <span className="text-[var(--foreground-subtle)]">global.namebot =</span> "{config.namebot}"
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                disabled={saveConfigMutation.isPending || isSaving}
                className="flex-1 bg-[var(--surface-raised)] hover:bg-[var(--border-strong)] border-[var(--border-strong)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveConfigMutation.isPending || isSaving}
                size="sm"
                className="flex-1 hover:from-[var(--accent-light)] hover:to-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(saveConfigMutation.isPending || isSaving) ? (
                  <div className="flex items-center gap-1.5">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span className="text-sm">
                      {saveConfigMutation.isPending ? "Menyimpan..." : "Berhasil!"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Save className="w-3.5 h-3.5" />
                    <span className="text-sm">Simpan</span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        duration={5000}
      />
    </>
  );
}
