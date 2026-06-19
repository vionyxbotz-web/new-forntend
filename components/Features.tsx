import { memo } from "react"
import { Zap, Shield, Headphones, Sparkles, Bot, Settings } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Akses Cepat",
    description: "Deploy bot WhatsApp Anda dalam hitungan detik dengan sistem otomatis kami",
  },
  {
    icon: Bot,
    title: "Fitur Lengkap",
    description: "RPG, jadibot, anti-spam, premium dan 300+ fitur lainnya",
  },
  {
    icon: Settings,
    title: "Panel User",
    description: "Dashboard intuitif untuk mengelola semua bot Anda dengan mudah",
  },
  {
    icon: Shield,
    title: "Keamanan Terjamin",
    description: "Enkripsi end-to-end dan backup otomatis untuk melindungi data Anda",
  },
  {
    icon: Sparkles,
    title: "Harga Fleksibel",
    description: "Paket yang dapat disesuaikan dengan kebutuhan bisnis Anda",
  },
  {
    icon: Headphones,
    title: "Support 24/7",
    description: "Tim support kami siap membantu Anda kapan saja",
  },
]

const Features = memo(function Features() {
  return (
    <section className="relative py-16 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16 animate-slide-up">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--foreground)] mb-4 tracking-tight">
            Kenapa Memilih <span className="text-[var(--accent)]">Vionyx?</span>
          </h2>
          <p className="text-base md:text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto">
            Platform terlengkap dengan fitur premium untuk kebutuhan bot WhatsApp Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="clay-card p-6 md:p-8 h-full animate-slide-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="w-14 h-14 rounded-[var(--radius)] bg-[var(--accent-glow)] border border-[var(--accent-border)] flex items-center justify-center mb-5">
                <feature.icon className="h-7 w-7 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2.5">{feature.title}</h3>
              <p className="text-[var(--foreground-muted)] leading-relaxed text-sm md:text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

export default Features
