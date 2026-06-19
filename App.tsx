import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useScrollToTop } from "./hooks/useScrollToTop";

// ScrollToTop component that handles auto scroll to top on route change
function ScrollToTop() {
  useScrollToTop();
  return null;
}

// Lazy load pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminCoinPackages = lazy(() => import("./pages/AdminCoinPackages"));
const AdminConfig = lazy(() => import("./pages/AdminConfig"));
const AdminRedeemCodes = lazy(() => import("./pages/AdminRedeemCodes"));
const AdminTestimonials = lazy(() => import("./pages/AdminTestimonials"));
const AdminBots = lazy(() => import("./pages/AdminBots"));
const TopUp = lazy(() => import("./pages/TopUp"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized loading fallback - minimal and fast
const PageLoader = () => (
  <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[var(--accent-border)] border-t-[var(--accent)] rounded-full animate-spin" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BackgroundProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen bg-[var(--bg)] text-[var(--foreground)] transition-colors duration-300">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/coin-packages"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminCoinPackages />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/config"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminConfig />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/redeem-codes"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminRedeemCodes />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/testimonials"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminTestimonials />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/bots"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminBots />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/top-up"
                  element={
                    <ProtectedRoute>
                      <TopUp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" />} />
              </Routes>
              </Suspense>
              <Toaster />
            </div>
          </BrowserRouter>
        </BackgroundProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
