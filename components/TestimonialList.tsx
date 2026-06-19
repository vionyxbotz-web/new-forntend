import { Star, MessageCircle } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

interface TestimonialListProps {
  isLight?: boolean
}

export default function TestimonialList({ isLight = false }: TestimonialListProps) {
  const baseUrl = (import.meta.env.VITE_CLIENT_TARGET as string) || "http://localhost:4000"

  const { data, isLoading } = useQuery({
    queryKey: ["testimonials"],
    queryFn: async () => {
      const response = await fetch(`${baseUrl}/testimonial/list?approvedOnly=true&limit=50`)
      const data = await response.json()
      return data.data
    },
  })

  const testimonials = data?.testimonials || []

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="clay-card p-6 animate-pulse">
            <div className="h-4 w-24 bg-[var(--border-strong)] rounded mb-4" />
            <div className="h-16 bg-[var(--border-strong)] rounded-[var(--radius-sm)] mb-6" />
            <div className="flex gap-3">
              <div className="w-11 h-11 bg-[var(--border-strong)] rounded-full" />
              <div className="flex-1">
                <div className="h-3.5 bg-[var(--border-strong)] rounded w-1/2 mb-2" />
                <div className="h-3 bg-[var(--border-strong)] rounded w-1/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (testimonials.length === 0) {
    return (
      <div className="clay-card text-center py-16 px-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[var(--radius-lg)] bg-[var(--accent-glow)] border border-[var(--accent-border)] mb-5">
          <MessageCircle className="w-8 h-8 text-[var(--accent)]" />
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Belum ada testimoni</h3>
        <p className="text-[var(--foreground-muted)] text-sm">
          Testimoni akan muncul setelah disetujui admin.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {testimonials.map((testimonial: any) => (
        <div key={testimonial.id} className="clay-card p-6 h-full flex flex-col">
          <div className="flex gap-1 mb-3">
            {[...Array(5)].map((_, i) => {
              const rating = Math.max(0, Math.min(5, Number(testimonial.rating) || 0))
              const filled = i < rating
              return (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    filled ? "text-amber-400 fill-amber-400" : "text-[var(--border-strong)]"
                  }`}
                />
              )
            })}
          </div>
          <blockquote className="text-sm text-[var(--foreground-muted)] mb-5 leading-relaxed line-clamp-4 flex-1">
            {testimonial.message}
          </blockquote>

          <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {testimonial.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-[var(--foreground)] text-sm truncate">{testimonial.username}</div>
              <div className="text-xs text-[var(--foreground-subtle)]">
                {new Date(testimonial.createdAt).toLocaleDateString("id-ID")}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
