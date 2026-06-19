import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode, useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAuth, setHasAuth] = useState(false);

  useEffect(() => {
    // Periksa token di localStorage dan sessionStorage
    const checkAuth = () => {
      const localToken = localStorage.getItem("token");
      const sessionToken = sessionStorage.getItem("token");
      
      if (localToken || sessionToken) {
        setHasAuth(true);
      } else {
        setHasAuth(false);
      }
      
      setIsChecking(false);
    };
    
    checkAuth();
  }, []);

  // Tampilkan loading atau komponen kosong saat memeriksa autentikasi
  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
    </div>;
  }

  // Jika tidak terautentikasi, redirect ke login
  if (!isAuthenticated && !hasAuth) {
    return <Navigate to="/login" />;
  }

  // Jika admin only dan bukan admin, redirect ke dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}
