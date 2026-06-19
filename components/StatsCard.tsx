import { memo } from "react"
import { LucideIcon } from "lucide-react"
import { AnimatedCounter } from "./LoadingSkeletons"

interface StatsCardProps {
  icon: LucideIcon
  title: string
  value: number
  color: "cyan" | "blue" | "purple" | "green"
  isLoading?: boolean
}

// Mapped onto the clay design system's semantic tokens.
// "cyan"/"blue" -> primary accent, "purple" -> accent-light tint,
// "green" -> success tone. Keeps the same prop API as before.
const colorMap = {
  cyan: { bg: "bg-[var(--accent-glow)]", border: "border-[var(--accent-border)]", icon: "text-[var(--accent)]" },
  blue: { bg: "bg-[var(--accent-glow)]", border: "border-[var(--accent-border)]", icon: "text-[var(--accent)]" },
  purple: { bg: "bg-[var(--accent-glow)]", border: "border-[var(--accent-border)]", icon: "text-[var(--accent-light)]" },
  green: { bg: "bg-[rgba(34,197,94,0.12)]", border: "border-[rgba(34,197,94,0.20)]", icon: "text-[#16A34A] dark:text-[#4ADE80]" },
}

const StatsCard = memo(function StatsCard({ icon: Icon, title, value, color, isLoading = false }: StatsCardProps) {
  const c = colorMap[color]
  return (
    <div className="clay-stat-card">
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-[var(--radius)] ${c.bg} border ${c.border} flex items-center justify-center ${isLoading ? "animate-pulse" : ""}`}>
          <Icon className={`h-6 w-6 ${c.icon}`} />
        </div>

        {isLoading ? (
          <div className="flex space-x-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="w-2.5 h-6 bg-[var(--border-strong)] rounded animate-pulse"
                style={{ animationDelay: `${i * 200}ms` }}
              />
            ))}
          </div>
        ) : (
          <AnimatedCounter value={value} />
        )}
      </div>
      <div className="text-sm text-[var(--foreground-muted)] font-medium">
        {isLoading ? (
          <div className="h-4 bg-[var(--border-strong)] rounded w-20 animate-pulse" />
        ) : (
          title
        )}
      </div>
    </div>
  )
})

export default StatsCard
