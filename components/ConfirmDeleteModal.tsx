import { memo } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmDeleteModal = memo(function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi Hapus",
  message,
  confirmText = "Ya, Hapus",
  cancelText = "Batal",
  isLoading = false,
}: ConfirmDeleteModalProps) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70  z-50"
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-[var(--surface)] to-black border border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          {/* Warning Icon */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[rgba(0,0,0,0.04)] dark:bg-[rgba(0,0,0,0.2)]" />
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-[var(--foreground)]" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-2xl font-bold text-[var(--foreground)]">
                {title}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[var(--foreground-muted)] text-base leading-relaxed mb-6">
              {message}
            </p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Tindakan ini tidak dapat dibatalkan!</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                disabled={isLoading}
                variant="outline"
                className="flex-1 border-[var(--border-strong)] text-[var(--foreground-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)]"
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-[var(--foreground)] font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menghapus...</span>
                  </div>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
});

export default ConfirmDeleteModal;
