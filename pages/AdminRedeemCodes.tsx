import { useState } from "react";
import { motion } from "framer-motion";
import { Gift, Plus, Trash2, Eye, Copy, Check } from "lucide-react";
import Header from "@/components/Header";
import RedeemUsageModal from "@/components/RedeemUsageModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface RedeemCode {
  code: string;
  coins: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  createdBy: string;
  usedBy: Array<{ username: string; usedAt: string }>;
}

export default function AdminRedeemCodes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState<RedeemCode | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    code: "",
    coins: 1000,
    maxUses: 100,
    expiresAt: "",
  });

  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';

  // Fetch redeem codes
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["redeemCodes"],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/redeem/list?limit=50`);
      return response.json();
    },
  });

  const handleCreate = async () => {
    if (formData.coins <= 0) {
      toast({
        title: "Error",
        description: "Jumlah coins harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    if (formData.maxUses <= 0) {
      toast({
        title: "Error",
        description: "Max uses harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${baseUrl}/redeem/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formData.code || undefined,
          coins: formData.coins,
          maxUses: formData.maxUses,
          expiresAt: formData.expiresAt || undefined,
          createdBy: "admin",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil!",
          description: `Kode ${data.data.code} berhasil dibuat`,
        });

        // Reset form
        setFormData({
          code: "",
          coins: 1000,
          maxUses: 100,
          expiresAt: "",
        });
        setShowCreateForm(false);

        // Refresh list
        refetch();
      } else {
        toast({
          title: "Gagal",
          description: getErrorMessage({ status: response.status, body: data, message: data.error, code: data.code }) || "Gagal membuat kode",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: getErrorTitle(error, "Terjadi Kesalahan"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (code: string) => {
    setDeleteCode(code);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCode) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${baseUrl}/redeem/${deleteCode}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil",
          description: "Kode berhasil dihapus",
        });
        refetch();
        setIsDeleteModalOpen(false);
        setDeleteCode(null);
      } else {
        toast({
          title: "Gagal",
          description: getErrorMessage({ status: response.status, body: data, message: data.error, code: data.code }) || "Gagal menghapus kode",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: getErrorTitle(error, "Terjadi Kesalahan"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast({
      title: "Tersalin!",
      description: `Kode ${code} berhasil disalin`,
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleViewDetails = (code: RedeemCode) => {
    setSelectedCode(code);
    setIsModalOpen(true);
  };

  const codes: RedeemCode[] = data?.data?.codes || [];

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-3`}>
                <Gift className="w-10 h-10 text-[var(--accent-light)]" />
                Manage Redeem Codes
              </h1>
              <p className="text-[var(--foreground-muted)]">Kelola kode redeem untuk user</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className=""
            >
              <Plus className="w-5 h-5 mr-2" />
              Buat Kode Baru
            </Button>
          </div>
        </motion.div>

        {/* Create Form */}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`clay-card p-6 mb-8`}
          >
            <h2 className={`text-2xl font-bold text-[var(--foreground)] mb-4`}>Buat Kode Redeem Baru</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`text-sm text-[var(--foreground-muted)] mb-2 block`}>
                  Kode (kosongkan untuk auto-generate)
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="AUTO"
                  maxLength={12}
                  className={`clay-input text-[var(--foreground)] uppercase`}
                />
              </div>
              <div>
                <label className={`text-sm text-[var(--foreground-muted)] mb-2 block`}>Jumlah Coins</label>
                <Input
                  type="number"
                  value={formData.coins}
                  onChange={(e) => setFormData({ ...formData, coins: parseInt(e.target.value) || 0 })}
                  placeholder="1000"
                  className={`clay-input text-[var(--foreground)]`}
                />
              </div>
              <div>
                <label className={`text-sm text-[var(--foreground-muted)] mb-2 block`}>Max Uses</label>
                <Input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  className={`clay-input text-[var(--foreground)]`}
                />
              </div>
              <div>
                <label className={`text-sm text-[var(--foreground-muted)] mb-2 block`}>
                  Tanggal Expired (opsional)
                </label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className={`clay-input text-[var(--foreground)]`}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className=""
              >
                {isCreating ? "Membuat..." : "Buat Kode"}
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-[var(--border-strong)] text-[var(--foreground-muted)]"
              >
                Batal
              </Button>
            </div>
          </motion.div>
        )}

        {/* Codes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`clay-card p-6`}
        >
          <h2 className={`text-2xl font-bold text-[var(--foreground)] mb-4`}>
            Daftar Kode Redeem ({codes.length})
          </h2>

          {isLoading ? (
            <div className={`text-center text-[var(--foreground-muted)] py-8`}>Loading...</div>
          ) : codes.length === 0 ? (
            <div className={`text-center text-[var(--foreground-muted)] py-8`}>
              Belum ada kode redeem. Buat kode baru untuk memulai!
            </div>
          ) : (
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b var(--border)`}>
                    <th className={`text-left p-3 text-[var(--foreground-muted)] font-semibold`}>Kode</th>
                    <th className={`text-left p-3 text-[var(--foreground-muted)] font-semibold`}>Coins</th>
                    <th className={`text-left p-3 text-[var(--foreground-muted)] font-semibold`}>Uses</th>
                    <th className={`text-left p-3 text-[var(--foreground-muted)] font-semibold`}>Status</th>
                    <th className={`text-left p-3 text-[var(--foreground-muted)] font-semibold`}>Expired</th>
                    <th className={`text-left p-3 text-[var(--foreground-muted)] font-semibold`}>Created</th>
                    <th className={`text-right p-3 text-[var(--foreground-muted)] font-semibold`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.map((code) => (
                    <tr
                      key={code.code}
                      className="border-b border-[var(--accent-border)] hover:bg-[var(--accent-glow)] transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[var(--accent-light)]">
                            {code.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="text-[var(--foreground-muted)] hover:text-[var(--accent-light)] transition-colors"
                          >
                            {copiedCode === code.code ? (
                              <Check className="w-4 h-4 text-[#16A34A] dark:text-[#4ADE80]" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className={`p-3 text-[var(--foreground)]`}>{code.coins.toLocaleString()}</td>
                      <td className={`p-3 text-[var(--foreground)]`}>
                        {code.currentUses} / {code.maxUses}
                      </td>
                      <td className="p-3">
                        {code.isActive ? (
                          <span className="px-2 py-1 bg-[rgba(34,197,94,0.12)] text-[#4ADE80] rounded text-xs">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-[rgba(239,68,68,0.12)] text-[#F87171] rounded text-xs">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[var(--foreground-muted)] text-sm">
                        {code.expiresAt
                          ? new Date(code.expiresAt).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="p-3 text-[var(--foreground-muted)] text-sm">
                        {new Date(code.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => handleViewDetails(code)}
                            size="sm"
                            variant="outline"
                            className="border-[var(--accent)]/50 text-[var(--accent)] hover:bg-[var(--accent-glow)]"
                            title="Lihat detail penggunaan"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteClick(code.code)}
                            size="sm"
                            variant="outline"
                            className="border-[rgba(239,68,68,0.20)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)]"
                            title="Hapus kode"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8"
        >
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Total Codes</p>
            <p className={`text-3xl font-bold text-[var(--foreground)]`}>{codes.length}</p>
          </div>
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Active Codes</p>
            <p className="text-3xl font-bold text-[#16A34A] dark:text-[#4ADE80]">
              {codes.filter((c) => c.isActive).length}
            </p>
          </div>
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Total Uses</p>
            <p className="text-3xl font-bold text-[var(--accent)]">
              {codes.reduce((sum, c) => sum + c.currentUses, 0)}
            </p>
          </div>
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Coins Distributed</p>
            <p className="text-3xl font-bold text-[#B45309] dark:text-[#FCD34D]">
              {codes.reduce((sum, c) => sum + c.coins * c.currentUses, 0).toLocaleString()}
            </p>
          </div>
        </motion.div>
      </main>

      {/* Usage Details Modal */}
      {selectedCode && (
        <RedeemUsageModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          code={selectedCode.code}
          coins={selectedCode.coins}
          usedBy={selectedCode.usedBy}
          maxUses={selectedCode.maxUses}
          currentUses={selectedCode.currentUses}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteCode(null);
        }}
        onConfirm={handleDeleteConfirm}
        message={`Yakin ingin menghapus kode ${deleteCode}? Semua data terkait akan hilang permanen.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
