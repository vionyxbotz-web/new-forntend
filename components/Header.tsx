import { useState, useEffect, memo } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu, X, LogOut, Sun, Moon, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useBackground } from "@/contexts/BackgroundContext"

const Header = memo(function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useBackground()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const navLinkClass =
    "text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors font-medium text-sm"

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "clay-nav" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--accent)] shadow-[var(--shadow-accent)] flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--foreground)] tracking-tight">
              Vionyx
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className={navLinkClass}>Beranda</Link>
            {isAuthenticated ? (
              <>
                <Link to={isAdmin ? "/admin" : "/dashboard"} className={navLinkClass}>
                  Dashboard
                </Link>
                {!isAdmin && (
                  <Link to="/top-up" className={navLinkClass}>Top Up</Link>
                )}
                <Link to="/profile" className={navLinkClass}>Profil</Link>
              </>
            ) : (
              <Link to="/login" className={navLinkClass}>Login</Link>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2.5">
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="icon"
              aria-label="Ganti tema"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link to="/register">
                <Button size="sm">Daftar</Button>
              </Link>
            )}
          </div>

          <div className="flex md:hidden items-center gap-1.5">
            <Button onClick={toggleTheme} variant="ghost" size="icon" aria-label="Ganti tema">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="clay-btn clay-btn-secondary !min-h-[44px] !min-w-[44px] !w-11 !h-11 !p-0"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden clay-nav animate-slide-up">
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-3 px-3 rounded-[var(--radius)] text-[var(--foreground)] hover:bg-[var(--accent-glow)] transition-colors font-medium min-h-[44px] flex items-center"
            >
              Beranda
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-3 rounded-[var(--radius)] text-[var(--foreground)] hover:bg-[var(--accent-glow)] transition-colors font-medium min-h-[44px] flex items-center"
                >
                  Dashboard
                </Link>
                {!isAdmin && (
                  <Link
                    to="/top-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-3 px-3 rounded-[var(--radius)] text-[var(--foreground)] hover:bg-[var(--accent-glow)] transition-colors font-medium min-h-[44px] flex items-center"
                  >
                    Top Up
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-3 rounded-[var(--radius)] text-[var(--foreground)] hover:bg-[var(--accent-glow)] transition-colors font-medium min-h-[44px] flex items-center"
                >
                  Profil
                </Link>
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 px-3 rounded-[var(--radius)] text-[var(--foreground)] hover:bg-[var(--accent-glow)] transition-colors font-medium min-h-[44px] flex items-center"
                >
                  Login
                </Link>
                <div className="pt-2">
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">Daftar</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
})

export default Header
