import { useState, useMemo, memo } from "react";
import { Plus, Minus, Trash2, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { AdminUser } from "~backend/admin/list_users";
import ConfirmDialog from "@/components/ConfirmDialog";
import { AdminUserTableSkeleton } from "./LoadingSkeletons";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

interface AdminUserTableProps {
  users: AdminUser[];
  onUpdate: () => void;
  isLoading?: boolean;
}

const AdminUserTable = memo(function AdminUserTable({ users, onUpdate, isLoading = false }: AdminUserTableProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [coinInputs, setCoinInputs] = useState<{ [key: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; user: AdminUser | null }>({
    isOpen: false,
    user: null,
  });
  
  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    
    const query = searchQuery.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.id.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleManageUser = async (userId: string, action: string, coins?: number) => {
    setLoading(userId);

    try {
      await backend.admin.manageUser({
        userId,
        action,
        coins,
      });

      toast({
        title: "Berhasil!",
        description: "Aksi berhasil dilakukan",
      });

      onUpdate();
    } catch (error: any) {
      console.error(error);
      toast({
        title: getErrorTitle(error, "Gagal"),
        description: getErrorMessage(error) || "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  // Show loading skeleton
  if (isLoading) {
    return <AdminUserTableSkeleton />;
  }
  
  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
        <Input
          type="text"
          placeholder="Cari user berdasarkan nama, email, atau ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
          <p className="text-[var(--foreground-muted)]">
            {searchQuery ? "Tidak ada user yang sesuai dengan pencarian" : "Tidak ada user yang ditemukan"}
          </p>
        </div>
      )}

      {filteredUsers.length > 0 && (
        <div className="clay-table-container overflow-auto">
          <table className="clay-table w-full">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Email</th>
            <th>Koin</th>
            <th>Role</th>
            <th>Kelola Koin</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td className="text-[var(--foreground-muted)]">{user.id}</td>
              <td className="font-medium">{user.name}</td>
              <td className="text-[var(--foreground-muted)]">{user.email}</td>
              <td className="text-[var(--accent)] font-semibold">{user.coins}</td>
              <td>
                <span className="clay-badge clay-badge-accent">
                  {user.role}
                </span>
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Jumlah"
                    value={coinInputs[user.id] || ""}
                    onChange={(e) =>
                      setCoinInputs({ ...coinInputs, [user.id]: parseInt(e.target.value) || 0 })
                    }
                    className="w-24 text-sm"
                  />
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => handleManageUser(user.id, "add-coins", coinInputs[user.id])}
                    disabled={loading === user.id || !coinInputs[user.id]}
                    className="!text-[#16A34A] dark:!text-[#4ADE80]"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() =>
                      handleManageUser(user.id, "subtract-coins", coinInputs[user.id])
                    }
                    disabled={loading === user.id || !coinInputs[user.id]}
                    className="!text-[#B45309] dark:!text-[#FCD34D]"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </td>
              <td>
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => setDeleteDialog({ isOpen: true, user })}
                  disabled={loading === user.id}
                  className="!text-[#EF4444]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
        </div>
      )}

      {/* Animated Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, user: null })}
        onConfirm={async () => {
          if (deleteDialog.user) {
            await handleManageUser(deleteDialog.user.id, "delete");
            setDeleteDialog({ isOpen: false, user: null });
          }
        }}
        title="Hapus User?"
        description={
          deleteDialog.user
            ? `Anda akan menghapus ${deleteDialog.user.name} (${deleteDialog.user.email}). Ini akan menghapus akun, semua bot, dan koleksi terkait. Tindakan tidak dapat dibatalkan.`
            : ""
        }
        confirmText="Hapus"
        cancelText="Batal"
        isLoading={deleteDialog.user ? loading === deleteDialog.user.id : false}
      />
    </div>
  );
});

export default AdminUserTable;

