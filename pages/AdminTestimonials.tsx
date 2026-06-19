import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Check, X, Trash2, Star } from "lucide-react";
import Header from "@/components/Header";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showErrorToast } from "@/lib/errorHandler";

interface Testimonial {
  id: string;
  username: string;
  rating: number;
  message: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTestimonials() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [deleteUsername, setDeleteUsername] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';

  // Fetch all testimonials (including pending)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["adminTestimonials"],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/testimonial/list?approvedOnly=false&limit=100`);
      return response.json();
    },
  });

  const handleApprove = async (username: string, approve: boolean) => {
    setProcessingId(username);

    try {
      const response = await fetch(`${baseUrl}/testimonial/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          isApproved: approve,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Berhasil!",
          description: result.message,
        });
        refetch();
        queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Terjadi kesalahan",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      showErrorToast(toast, error, "Gagal Memproses", "Terjadi kesalahan saat memproses testimoni");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteClick = (username: string) => {
    setDeleteUsername(username);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUsername) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${baseUrl}/testimonial/${deleteUsername}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Testimoni berhasil dihapus",
        });
        refetch();
        queryClient.invalidateQueries({ queryKey: ["testimonials"] });
        setIsDeleteModalOpen(false);
        setDeleteUsername(null);
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal menghapus testimoni",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      showErrorToast(toast, error, "Gagal Menghapus", "Terjadi kesalahan saat menghapus testimoni");
    } finally {
      setIsDeleting(false);
    }
  };

  const testimonials: Testimonial[] = data?.data?.testimonials || [];
  const pendingCount = testimonials.filter(t => !t.isApproved).length;
  const approvedCount = testimonials.filter(t => t.isApproved).length;

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
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)] mb-2 flex items-center gap-2 sm:gap-3`}>
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--accent-light)]" />
                <span>Manage Testimoni</span>
              </h1>
              <p className={`text-sm sm:text-base text-[var(--foreground-muted)]`}>Kelola testimoni dari user</p>
            </div>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Total Testimoni</p>
            <p className={`text-3xl font-bold text-[var(--foreground)]`}>{testimonials.length}</p>
          </div>
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Menunggu Approval</p>
            <p className="text-3xl font-bold text-[#B45309] dark:text-[#FCD34D]">{pendingCount}</p>
          </div>
          <div className={`clay-card-sm p-4`}>
            <p className={`text-sm mb-1 text-[var(--foreground-muted)]`}>Disetujui</p>
            <p className="text-3xl font-bold text-[#16A34A] dark:text-[#4ADE80]">{approvedCount}</p>
          </div>
        </motion.div>

        {/* Testimonials List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`clay-card p-6`}
        >
          <h2 className={`text-2xl font-bold text-[var(--foreground)] mb-6`}>
            Daftar Testimoni ({testimonials.length})
          </h2>

          {isLoading ? (
            <div className={`text-center py-8 text-[var(--foreground-muted)]`}>Loading...</div>
          ) : testimonials.length === 0 ? (
            <div className={`text-center py-8 text-[var(--foreground-muted)]`}>
              Belum ada testimoni
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`clay-card-sm p-4 sm:p-6 ${
                    testimonial.isApproved
                      ? '!bg-[rgba(34,197,94,0.06)] !border-[rgba(34,197,94,0.20)]'
                      : '!bg-[rgba(234,179,8,0.06)] !border-[rgba(234,179,8,0.20)]'
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* User Info & Message */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[var(--accent)] rounded-full flex items-center justify-center shrink-0">
                          <span className="text-[var(--foreground)] font-bold text-lg">
                            {testimonial.username?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className={`font-bold text-[var(--foreground)] text-lg`}>{testimonial.username || 'Unknown User'}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < testimonial.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-[var(--foreground-muted)]"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className={`text-sm text-[var(--foreground-muted)]`}>
                              {testimonial.rating}/5
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className={`text-[var(--foreground-muted)] leading-relaxed mb-3`}>
                        "{testimonial.message}"
                      </p>

                      <div className={`flex items-center gap-4 text-xs text-[var(--foreground-muted)]`}>
                        <span>
                          Dibuat: {new Date(testimonial.createdAt).toLocaleDateString("id-ID")}
                        </span>
                        {testimonial.updatedAt !== testimonial.createdAt && (
                          <span>
                            Diupdate: {new Date(testimonial.updatedAt).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-[var(--border)]/30 pt-4">
                      {/* Status Badge */}
                      <div>
                        {testimonial.isApproved ? (
                          <span className="inline-flex px-3 py-1 bg-[rgba(34,197,94,0.12)] text-[#4ADE80] rounded-full text-xs font-semibold">
                            ✓ Disetujui
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 bg-[rgba(234,179,8,0.12)] text-[#FCD34D] rounded-full text-xs font-semibold">
                            ⏳ Pending
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        {!testimonial.isApproved ? (
                          <Button
                            onClick={() => handleApprove(testimonial.username || '', true)}
                            disabled={processingId === testimonial.username || !testimonial.username}
                            size="sm"
                            className="!bg-[#16A34A] hover:!bg-[#15803D] !text-white flex-1 sm:flex-none"
                          >
                            <Check className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Setujui</span>
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleApprove(testimonial.username || '', false)}
                            disabled={processingId === testimonial.username || !testimonial.username}
                            size="sm"
                            variant="outline"
                            className="border-[rgba(249,115,22,0.20)] text-[#F97316] hover:bg-[rgba(249,115,22,0.12)] flex-1 sm:flex-none"
                          >
                            <X className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">Batalkan</span>
                          </Button>
                        )}

                        <Button
                          onClick={() => handleDeleteClick(testimonial.username || '')}
                          disabled={!testimonial.username}
                          size="sm"
                          variant="outline"
                          className="border-[rgba(239,68,68,0.20)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.12)] flex-1 sm:flex-none"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Hapus</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteUsername(null);
        }}
        onConfirm={handleDeleteConfirm}
        message={`Yakin ingin menghapus testimoni dari ${deleteUsername || 'user ini'}? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={isDeleting}
      />
    </div>
  );
}
