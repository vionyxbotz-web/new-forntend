import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[var(--bg)]">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 text-center px-4"
      >
        <AlertCircle className="h-24 w-24 text-[var(--accent)] mx-auto mb-6 animate-pulse" />
        <h1 className="text-8xl font-bold bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className={`text-3xl font-bold text-[var(--foreground)] mb-4`}>Halaman Tidak Ditemukan</h2>
        <p className={`text-[var(--foreground-muted)] mb-8 max-w-md mx-auto`}>
          Maaf, halaman yang Anda cari tidak dapat ditemukan. Silakan kembali ke beranda.
        </p>
        <Link to="/">
          <Button className="text-[var(--foreground)] font-semibold px-8 py-6 rounded-lg shadow-lg shadow-[var(--shadow-accent)]">
            <Home className="mr-2 h-5 w-5" />
            Kembali ke Beranda
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
