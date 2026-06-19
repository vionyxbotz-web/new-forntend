import { useState, useEffect, memo } from "react";
import { Star, MessageSquare, Send, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { getErrorMessage, getErrorTitle } from "@/lib/errorHandler";

const TestimonialForm = memo(function TestimonialForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || 'http://localhost:4000';

  // Fetch existing testimonial
  const { data: existingTestimonial, isLoading } = useQuery({
    queryKey: ["myTestimonial", user?.name],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/testimonial/my/${user?.name}`);
      const data = await response.json();
      return data.data;
    },
    enabled: !!user,
  });

  // Load existing data if available
  useEffect(() => {
    if (existingTestimonial) {
      setRating(existingTestimonial.rating);
      setMessage(existingTestimonial.message);
      setIsEditing(true);
    }
  }, [existingTestimonial]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Testimoni tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    if (message.length < 10) {
      toast({
        title: "Error",
        description: "Testimoni minimal 10 karakter",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = isEditing ? '/testimonial/update' : '/testimonial/create';
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: user?.name,
          rating,
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil! 🎉",
          description: data.message,
        });
        queryClient.invalidateQueries({ queryKey: ["myTestimonial", user?.name] });
        queryClient.invalidateQueries({ queryKey: ["testimonials"] });
      } else {
        toast({
          title: "Gagal",
          description: getErrorMessage({ status: response.status, body: data, message: data.error, code: data.code }) || "Terjadi kesalahan",
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
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`${baseUrl}/testimonial/${user.name}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Berhasil",
          description: "Testimoni berhasil dihapus",
        });
        queryClient.invalidateQueries({ queryKey: ["myTestimonial", user.name] });
        queryClient.invalidateQueries({ queryKey: ["testimonials"] });
        setIsDeleteModalOpen(false);
        
        // Reset form
        setRating(5);
        setMessage("");
        setIsEditing(false);
      } else {
        toast({
          title: "Gagal",
          description: getErrorMessage({ status: response.status, body: data, message: data.error, code: data.code }) || "Gagal menghapus testimoni",
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

  if (isLoading) {
    return (
      <div className="clay-card !bg-[var(--accent-glow)] p-6">
        <div className="text-center py-8 text-[var(--foreground-muted)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="clay-card !bg-[var(--accent-glow)] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-[var(--accent)] rounded-[var(--radius)] shadow-[var(--shadow-accent)]">
          <MessageSquare className="w-6 h-6 text-[var(--foreground)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">
            {isEditing ? 'Edit' : 'Buat'} Testimoni
          </h2>
          <p className="text-[var(--foreground-muted)] text-sm">
            {isEditing ? 'Update testimoni Anda' : 'Bagikan pengalaman Anda menggunakan Vionyx'}
          </p>
        </div>
      </div>

      {existingTestimonial && !existingTestimonial.isApproved && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-300">
            ⏳ Testimoni Anda sedang menunggu persetujuan admin
          </p>
        </div>
      )}

      {existingTestimonial && existingTestimonial.isApproved && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-300">
            ✅ Testimoni Anda telah disetujui dan ditampilkan!
          </p>
        </div>
      )}

      {/* Rating */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[var(--foreground-muted)] mb-3 block">
          Rating Anda
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-all hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  star <= rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-[var(--foreground-muted)]"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-[var(--foreground-subtle)] mt-2">
          {rating === 5 && "⭐ Sangat Puas"}
          {rating === 4 && "😊 Puas"}
          {rating === 3 && "😐 Cukup"}
          {rating === 2 && "😕 Kurang Puas"}
          {rating === 1 && "😞 Tidak Puas"}
        </p>
      </div>

      {/* Message */}
      <div className="mb-6">
        <label className="text-sm font-medium text-[var(--foreground-muted)] mb-3 block">
          Testimoni Anda
        </label>
        <Textarea
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          placeholder="Ceritakan pengalaman Anda menggunakan Vionyx..."
          className="clay-input text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] min-h-32 resize-none"
          maxLength={500}
        />
        <div className="flex justify-between items-center mt-2">
          <p className={`text-xs ${message.length < 10 ? 'text-red-400' : 'text-green-400'}`}>
            {message.length < 10 
              ? `⚠️ Minimal 10 karakter (kurang ${10 - message.length})`
              : '✓ Testimoni valid'}
          </p>
          <p className="text-xs text-[var(--foreground-subtle)]">
            {message.length}/500 karakter
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="space-y-3">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !message.trim() || message.length < 10}
          className="w-full"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Menyimpan...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {isEditing ? <Edit className="w-5 h-5" /> : <Send className="w-5 h-5" />}
              <span>{isEditing ? 'Update Testimoni' : 'Kirim Testimoni'}</span>
            </div>
          )}
        </Button>

        {/* Delete Button (only show if editing) */}
        {isEditing && existingTestimonial && (
          <Button
            onClick={() => setIsDeleteModalOpen(true)}
            variant="outline"
            className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 py-6"
          >
            <Trash2 className="w-5 h-5 mr-2" />
            Hapus Testimoni
          </Button>
        )}
      </div>

      <p className="text-xs text-[var(--foreground-subtle)] mt-4 text-center">
        💡 Testimoni akan ditampilkan setelah disetujui oleh admin
      </p>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="Yakin ingin menghapus testimoni Anda? Tindakan ini tidak dapat dibatalkan."
        isLoading={isDeleting}
      />
    </div>
  );
});

export default TestimonialForm;
