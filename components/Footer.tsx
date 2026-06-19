import { Mail, Bot } from "lucide-react"

interface FooterProps {
  isLight?: boolean
}

export default function Footer({ isLight = false }: FooterProps) {
  return (
    <footer className="relative border-t border-[var(--border)] mt-16 bg-[var(--surface)]">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent)] flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Vionyx</h3>
            </div>
            <p className="text-[var(--foreground-muted)] text-sm leading-relaxed">
              Platform terpercaya untuk bot WhatsApp premium dengan fitur lengkap dan support 24/7.
            </p>
          </div>

          <div>
            <h4 className="text-[var(--foreground)] font-semibold mb-4">Support</h4>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--accent-glow)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <a
                href="mailto:vionyxbotz@gmail.com"
                className="text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors text-sm"
              >
                vionyxbotz@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] text-center text-[var(--foreground-subtle)] text-sm">
          &copy; {new Date().getFullYear()} Vionyx — The Next Era.
        </div>
      </div>
    </footer>
  )
}
