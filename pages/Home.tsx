import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Features from "@/components/Features"
import CTASection from "@/components/CTASection"
import TestimonialList from "@/components/TestimonialList"
import Footer from "@/components/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { useQuery } from "@tanstack/react-query"

const steps = [
  { step: "01", title: "Daftar", desc: "Buat akun, masuk ke dashboard, dan siapkan konfigurasi dasar." },
  { step: "02", title: "Connect", desc: "Hubungkan nomor WhatsApp dan aktifkan bot sesuai kebutuhan." },
  { step: "03", title: "Scale", desc: "Pantau performa, tambah fitur, dan kelola semuanya dari panel." },
]

export default function Home() {
  const { isAuthenticated } = useAuth()
  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || "http://localhost:4000"

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["landingStats"],
    queryFn: async () => {
      const res = await fetch(`${baseUrl}/admin/statistics`)
      if (!res.ok) throw new Error("Failed to fetch statistics")
      return (await res.json()) as {
        totalUsers: number
        totalTopUps: number
        totalActiveBots: number
        totalRevenue: number
      }
    },
    refetchInterval: 15000,
  })

  return (
    <div className="relative min-h-screen bg-[var(--bg)]">
      <Header />
      <main>
        <Hero />

        {/* Workflow */}
        <section id="how" className="relative py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              <div className="lg:col-span-5">
                <h2 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
                  Workflow sederhana,
                  <span className="block text-[var(--foreground-muted)] font-semibold mt-1">
                    hasil terasa profesional.
                  </span>
                </h2>
                <p className="mt-4 text-[var(--foreground-muted)] leading-relaxed text-sm md:text-base">
                  Fokus ke konten dan bisnis kamu. Biarkan Vionyx mengurus panel, manajemen bot,
                  dan stabilitas sistem.
                </p>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {steps.map((s) => (
                  <div key={s.step} className="clay-card p-5">
                    <div className="text-xs font-bold text-[var(--accent)] tracking-wider">{s.step}</div>
                    <div className="text-[var(--foreground)] font-bold mt-2">{s.title}</div>
                    <div className="text-sm text-[var(--foreground-muted)] mt-2 leading-relaxed">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live stats strip */}
            <div className="mt-10 grid grid-cols-2 gap-3 md:gap-4 max-w-2xl">
              <div className="clay-card-sm p-5 text-left">
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {isStatsLoading ? (
                    <span className="inline-block h-5 w-12 rounded bg-[var(--border-strong)] animate-pulse" />
                  ) : (
                    stats?.totalActiveBots ?? 0
                  )}
                </div>
                <div className="text-xs text-[var(--foreground-subtle)] mt-1">Bot aktif</div>
              </div>
              <div className="clay-card-sm p-5 text-left">
                <div className="text-lg font-bold text-[var(--foreground)]">
                  {isStatsLoading ? (
                    <span className="inline-block h-5 w-16 rounded bg-[var(--border-strong)] animate-pulse" />
                  ) : (
                    (stats?.totalUsers ?? 0).toLocaleString("id-ID")
                  )}
                </div>
                <div className="text-xs text-[var(--foreground-subtle)] mt-1">Pengguna</div>
              </div>
            </div>
          </div>
        </section>

        <Features />

        {/* Testimonials */}
        <section className="relative py-16 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between gap-6 flex-wrap mb-10">
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
                  Dipercaya oleh pengguna
                  <span className="block text-[var(--foreground-muted)] font-semibold mt-1">
                    dari berbagai kebutuhan.
                  </span>
                </h2>
                <p className="text-[var(--foreground-muted)] mt-3 max-w-2xl text-sm md:text-base">
                  Testimoni yang ditampilkan berasal dari pengguna dan telah disetujui admin.
                </p>
              </div>
            </div>

            <TestimonialList />
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
