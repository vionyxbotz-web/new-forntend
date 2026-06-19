import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HistorySkeleton } from "./LoadingSkeletons";

interface Transaction {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  payment_name: string;
  amount: number;
  coins: number;
  status: string;
  checkout_url: string;
  createdAt: string;
}

interface PaymentHistoryProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export default function PaymentHistory({ transactions, isLoading = false }: PaymentHistoryProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <HistorySkeleton itemCount={3} />;
  }

  if (transactions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <AlertCircle className="h-12 w-12 text-[var(--foreground-subtle)] mx-auto mb-4" />
        </motion.div>
        <p className="text-[var(--foreground-muted)]">Belum ada riwayat transaksi</p>
      </motion.div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle2 className="h-3 w-3" />
            <span>Berhasil</span>
          </div>
        );
      case "UNPAID":
        return (
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </div>
        );
      case "EXPIRED":
        return (
          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="h-3 w-3" />
            <span>Kadaluarsa</span>
          </div>
        );
      default:
        return (
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--border)] text-[var(--foreground-muted)] border border-[var(--border-strong)]/30">
            {status}
          </div>
        );
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
      {transactions.map((transaction, index) => (
        <motion.div
          key={transaction.reference}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: index * 0.05,
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          whileHover={{ 
            scale: 1.02,
            borderColor: "rgba(6, 182, 212, 0.6)",
            transition: { duration: 0.2 }
          }}
          onClick={() => navigate(`/payment/${transaction.reference}`)}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 hover:border-[var(--accent)]/40 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.1 }}
                className="text-[var(--foreground)] font-semibold mb-1"
              >
                {transaction.coins} Koin - Rp {transaction.amount.toLocaleString("id-ID")}
              </motion.div>
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 + 0.2 }}
                className="text-sm text-[var(--foreground-muted)]"
              >
                {transaction.payment_name}
              </motion.div>
            </div>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                delay: index * 0.05 + 0.3,
                type: "spring",
                stiffness: 400
              }}
            >
              {getStatusBadge(transaction.status)}
            </motion.div>
          </div>
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.4 }}
              className="text-xs text-[var(--foreground-subtle)]"
            >
              {new Date(transaction.createdAt).toLocaleString("id-ID")}
            </motion.div>
            <ExternalLink className="h-4 w-4 text-[var(--accent)]" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
