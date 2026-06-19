import { Link } from "react-router-dom"
import { Rocket, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function CTASection() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative py-16 md:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="clay-card-raised p-8 md:p-14 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-[var(--radius-lg)] bg-[var(--accent)] shadow-[var(--shadow-accent)] flex items-center justify-center mx-auto mb-6">
            <Rocket className="h-8 w-8 text-white" />
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-5 tracking-tight">
            Siap Memulai Perjalanan Anda?
          </h2>

          <p className="text-base md:text-xl text-[var(--foreground-muted)] mb-9 max-w-2xl mx-auto leading-relaxed">
            Daftar sekarang dan dapatkan akses penuh ke platform bot WhatsApp terlengkap.
            Bangun bot profesional Anda hari ini.
          </p>

          <Link to={isAuthenticated ? "/dashboard" : "/register"}>
            <Button size="lg" className="group">
              Daftar Sekarang
              <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
