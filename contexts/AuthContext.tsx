import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";

interface User {
  id: number;
  email: string;
  username: string;
  name: string;
  phone?: string;
  role: string;
  coins: number;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk memuat data autentikasi dari localStorage
  const loadAuthData = () => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        
        // Tambahkan token ke sessionStorage juga untuk redundansi
        sessionStorage.setItem("token", storedToken);
        sessionStorage.setItem("user", storedUser);
      }
    } catch (error) {
      console.error("Error loading auth data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Memuat data autentikasi saat komponen dimount
  useEffect(() => {
    loadAuthData();
    
    // Tambahkan event listener untuk storage changes
    window.addEventListener("storage", loadAuthData);
    
    return () => {
      window.removeEventListener("storage", loadAuthData);
    };
  }, []);

  const login = useCallback((user: User, token: string) => {
    setUser(user);
    setToken(token);
    
    // Simpan di localStorage dan sessionStorage
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(user));
    sessionStorage.setItem("token", token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    
    // Hapus dari localStorage dan sessionStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
    }),
    [user, token, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
