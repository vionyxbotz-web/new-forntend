import { memo } from "react";
import { AlertTriangle, Trash2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  confirmVariant?: "destructive" | "default";
  icon?: "delete" | "restart" | "warning";
  isLoading?: boolean;
}

const iconComponents = {
  delete: Trash2,
  restart: RefreshCw,
  warning: AlertTriangle,
};

const iconColors = {
  delete: "text-red-400",
  restart: "text-[var(--accent)]",
  warning: "text-yellow-400",
};

const ConfirmationModal = memo(function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  confirmVariant = "default",
  icon = "warning",
  isLoading = false
}: ConfirmationModalProps) {
  const IconComponent = iconComponents[icon];

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-[var(--surface)]  z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="clay-card p-6 max-w-md w-full shadow-2xl shadow-[var(--shadow-accent)]"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full bg-[var(--surface-raised)] ${iconColors[icon]}`}>
                  <div className={isLoading ? 'animate-spin' : ''}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[var(--foreground)] text-center mb-3">
                {title}
              </h3>

              {/* Description */}
              <p className="text-[var(--foreground-muted)] text-center mb-6 leading-relaxed">
                {description}
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={isLoading}
                  className="flex-1 border-[var(--border-strong)] text-[var(--foreground-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--foreground)] transition-all duration-200"
                >
                  Batal
                </Button>

                <Button
                  onClick={handleConfirm}
                  variant={confirmVariant}
                  disabled={isLoading}
                  className={`flex-1 transition-all duration-200 ${
                    confirmVariant === "destructive"
                      ? "bg-red-600 hover:bg-red-700 text-[var(--foreground)] shadow-lg shadow-red-500/25"
                      : "text-[var(--foreground)] shadow-lg shadow-[var(--shadow-accent)]"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {isLoading ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      icon === "delete" ? <Trash2 className="h-4 w-4" /> :
                      icon === "restart" ? <RefreshCw className="h-4 w-4" /> : null
                    )}
                    <span>{isLoading ? "Memproses..." : confirmText}</span>
                  </div>
                </Button>
              </div>

              {/* Progress indicator */}
              {isLoading && (
                <div className="mt-4">
                  <div className="w-full bg-[var(--surface-raised)] rounded-full h-1">
                    <div className="h-1 rounded-full animate-pulse w-full" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
});

export default ConfirmationModal;
