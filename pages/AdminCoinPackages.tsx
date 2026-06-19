import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Coins } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import backend from "~backend/client";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface CoinPackage {
  _id: string;
  coins: number;
  price: number;
  active: boolean;
}

export default function AdminCoinPackages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<CoinPackage | null>(null);
  const [formData, setFormData] = useState({
    coins: "",
    price: "",
    active: true,
  });

  const { data: packagesData, isLoading } = useQuery({
    queryKey: ["admin-coin-packages"],
    queryFn: () => backend.admin.getAllPackages(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { coins: number; price: number }) =>
      backend.admin.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coin-packages"] });
      toast({
        title: "Berhasil!",
        description: "Paket koin berhasil dibuat",
      });
      setIsCreateModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: getErrorMessage(error) || "Gagal membuat paket koin",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; coins: number; price: number; active: boolean }) =>
      backend.admin.updatePackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coin-packages"] });
      toast({
        title: "Berhasil!",
        description: "Paket koin berhasil diupdate",
      });
      setIsEditModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: getErrorMessage(error) || "Gagal mengupdate paket koin",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => backend.admin.deletePackage({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coin-packages"] });
      toast({
        title: "Berhasil!",
        description: "Paket koin berhasil dihapus",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Gagal",
        description: getErrorMessage(error) || "Gagal menghapus paket koin",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({ coins: "", price: "", active: true });
    setEditingPackage(null);
  };

  const handleCreate = () => {
    if (!formData.coins || !formData.price) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    createMutation.mutate({
      coins: parseInt(formData.coins),
      price: parseInt(formData.price),
    });
  };

  const handleUpdate = () => {
    if (!editingPackage || !formData.coins || !formData.price) {
      toast({
        title: "Error",
        description: "Semua field harus diisi",
        variant: "destructive",
      });
      return;
    }

    updateMutation.mutate({
      id: editingPackage._id,
      coins: parseInt(formData.coins),
      price: parseInt(formData.price),
      active: formData.active,
    });
  };

  const handleEdit = (pkg: CoinPackage) => {
    setEditingPackage(pkg);
    setFormData({
      coins: pkg.coins.toString(),
      price: pkg.price.toString(),
      active: pkg.active,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-4xl font-bold text-[var(--foreground)] mb-2`}>
                Kelola Paket Koin
              </h1>
              <p className="text-[var(--foreground-muted)]">Atur paket koin untuk user</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className=""
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Paket
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`clay-card p-6`}
        >
          {isLoading ? (
            <div className={`text-center text-[var(--foreground-muted)] py-8`}>Loading...</div>
          ) : packagesData?.packages && packagesData.packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packagesData.packages.map((pkg: CoinPackage) => (
                <motion.div
                  key={pkg._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent-light)]/10 border border-[var(--accent-border)] rounded-xl p-6 ${
                    !pkg.active ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Coins className="w-6 h-6 text-[var(--accent)]" />
                      <span className={`text-2xl font-bold text-[var(--foreground)]`}>
                        {pkg.coins}
                      </span>
                      <span className="text-[var(--foreground-muted)]">Koin</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(pkg)}
                        className="text-[var(--accent)] hover:text-[var(--accent-light)]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(pkg._id)}
                        className="text-[#EF4444] hover:text-[#F87171]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-[var(--accent)] mb-2">
                    {formatRupiah(pkg.price)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm text-[var(--foreground-muted)]`}>
                      {pkg.active ? "Aktif" : "Tidak Aktif"}
                    </span>
                    <span className={`text-sm text-[var(--foreground-muted)]`}>
                      Rp {(pkg.price / pkg.coins).toFixed(0)} / koin
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`text-center text-[var(--foreground-muted)] py-8`}>
              Belum ada paket koin. Tambahkan paket baru.
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-[var(--surface)] border-[var(--accent-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">Tambah Paket Koin</DialogTitle>
            <DialogDescription className="text-[var(--foreground-muted)]">
              Buat paket koin baru untuk user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="coins" className="text-[var(--border)]">
                Jumlah Koin
              </Label>
              <Input
                id="coins"
                type="number"
                placeholder="10"
                value={formData.coins}
                onChange={(e) =>
                  setFormData({ ...formData, coins: e.target.value })
                }
                className="bg-[var(--surface)] border-[var(--accent-border)] text-[var(--foreground)]"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-[var(--border)]">
                Harga (IDR)
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="10000"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="bg-[var(--surface)] border-[var(--accent-border)] text-[var(--foreground)]"
              />
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="w-full "
            >
              {createMutation.isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[var(--surface)] border-[var(--accent-border)]">
          <DialogHeader>
            <DialogTitle className="text-[var(--foreground)]">Edit Paket Koin</DialogTitle>
            <DialogDescription className="text-[var(--foreground-muted)]">
              Update paket koin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-coins" className="text-[var(--border)]">
                Jumlah Koin
              </Label>
              <Input
                id="edit-coins"
                type="number"
                value={formData.coins}
                onChange={(e) =>
                  setFormData({ ...formData, coins: e.target.value })
                }
                className="bg-[var(--surface)] border-[var(--accent-border)] text-[var(--foreground)]"
              />
            </div>
            <div>
              <Label htmlFor="edit-price" className="text-[var(--border)]">
                Harga (IDR)
              </Label>
              <Input
                id="edit-price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="bg-[var(--surface)] border-[var(--accent-border)] text-[var(--foreground)]"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <Label htmlFor="active" className="text-[var(--border)]">
                Aktif
              </Label>
            </div>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              className="w-full "
            >
              {updateMutation.isPending ? "Menyimpan..." : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
