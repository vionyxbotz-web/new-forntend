import { memo } from "react"
import { Link } from "react-router-dom"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

const stats = [
  { value: "99%", label: "Uptime" },
  { value: "24/7", label: "Support" },
  { value: "1000+", label: "Users" },
  { value: "100%", label: "Secure" },
]

const Hero = memo(function Hero() {
  const { isAuthenticated } = useAuth()

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center px-4 pt-24 pb-12 overflow-hidden">
      <div className="max-w-5xl mx-auto text-center">
        <div className="animate-slide-up">
          <div className="clay-label-pill mb-7">
            <Sparkles className="h-3.5 w-3.5" />
            Platform Bot WhatsApp #1 di Indonesia
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-[1.1] tracking-tight text-[var(--foreground)]">
            Vionyx —{" "}
            <span className="text-[var(--accent)]">
              Solusi Bot WhatsApp Premium
            </span>
          </h1>

          <p className="text-base md:text-xl text-[var(--foreground-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Bangun bot WhatsApp profesional dengan fitur lengkap, sistem jadibot canggih, dan
            panel management yang mudah digunakan.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center px-2">
            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto group">
                Mulai Sekarang
                <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to={isAuthenticated ? "/dashboard" : "/login"} className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="clay-stat-card animate-scale-in items-center text-center"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="text-2xl md:text-3xl font-bold text-[var(--accent)]">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-[var(--foreground-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default Hero
