import { useState, useEffect } from 'react';
import { useApiClient } from '@/hooks/useApiClient';
import { Mail, Lock, User, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getErrorMessage } from '@/lib/errorHandler';

type RegistrationStep = 'email' | 'otp' | 'password' | 'success';

export function RegisterWithOTP() {
  const api = useApiClient();
  const [step, setStep] = useState<RegistrationStep>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [userId, setUserId] = useState('');

  // OTP Timer countdown
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Format email tidak valid');
      }

      if (!name.trim()) {
        throw new Error('Nama harus diisi');
      }

      await api.post('/auth/request-otp', { email, name });
      setStep('otp');
      setOtpTimer(300); // 5 minutes
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Gagal mengirim OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        throw new Error('OTP harus berupa 6 digit angka');
      }

      await api.post('/auth/verify-otp', { email, otp });
      setStep('password');
    } catch (err: any) {
      setError(getErrorMessage(err) || 'OTP tidak valid');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (password.length < 8) {
        throw new Error('Password minimal 8 karakter');
      }

      if (password !== confirmPassword) {
        throw new Error('Password tidak cocok');
      }

      // Get captcha token (implement based on your captcha provider)
      const captchaToken = 'placeholder-captcha-token';

      const response = await api.post('/auth/register', {
        email,
        name,
        password,
        otp,
        captchaToken
      });

      setUserId(response.id);
      setStep('success');
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      await api.post('/auth/request-otp', { email, name });
      setOtpTimer(300);
      setOtp('');
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Gagal mengirim ulang OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent-light)] bg-clip-text text-transparent">
            VIONYX
          </h1>
          <p className="text-[var(--foreground-muted)] mt-2">Daftar akun baru</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--surface-raised)] mb-6">Langkah 1: Email & Nama</h2>

              <div>
                <label className="block text-sm font-medium text-[var(--border)] mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-[var(--foreground-muted)]" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-4 py-2 border border-[var(--foreground-muted)] rounded-lg focus:ring-2 focus:ring-[var(--accent-light)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--border)] mb-2">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-[var(--foreground-muted)]" size={20} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2 border border-[var(--foreground-muted)] rounded-lg focus:ring-2 focus:ring-[var(--accent-light)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent-light)] text-[var(--foreground)] font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={20} className="animate-spin" />
                    Mengirim...
                  </span>
                ) : (
                  'Kirim OTP'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--surface-raised)] mb-6">Langkah 2: Verifikasi OTP</h2>

              <div className="bg-blue-50 border border-[var(--accent-border)] rounded-lg p-4 mb-4">
                <p className="text-sm text-[var(--border)]">
                  Kode OTP telah dikirim ke <strong>{email}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--border)] mb-2">
                  Kode OTP (6 digit)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-[var(--foreground-muted)] rounded-lg focus:ring-2 focus:ring-[var(--accent-light)] focus:border-transparent font-mono"
                  required
                />
              </div>

              <div className="text-center">
                {otpTimer > 0 ? (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Berlaku dalam <strong>{Math.floor(otpTimer / 60)}:{String(otpTimer % 60).padStart(2, '0')}</strong>
                  </p>
                ) : (
                  <p className="text-sm text-red-600">OTP telah kadaluarsa</p>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent-light)] text-[var(--foreground)] font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={20} className="animate-spin" />
                    Verifikasi...
                  </span>
                ) : (
                  'Verifikasi OTP'
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || otpTimer > 0}
                className="w-full text-[var(--accent-light)] font-semibold py-2 hover:text-[var(--accent-light)] transition disabled:opacity-50"
              >
                Kirim Ulang OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                }}
                className="w-full text-[var(--foreground-muted)] font-semibold py-2 hover:text-[var(--border)] transition"
              >
                Kembali
              </button>
            </form>
          )}

          {/* Step 3: Password */}
          {step === 'password' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <h2 className="text-2xl font-bold text-[var(--surface-raised)] mb-6">Langkah 3: Buat Password</h2>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-sm text-green-700">Email berhasil diverifikasi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--border)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-[var(--foreground-muted)]" size={20} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    className="w-full pl-10 pr-4 py-2 border border-[var(--foreground-muted)] rounded-lg focus:ring-2 focus:ring-[var(--accent-light)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--border)] mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-[var(--foreground-muted)]" size={20} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full pl-10 pr-4 py-2 border border-[var(--foreground-muted)] rounded-lg focus:ring-2 focus:ring-[var(--accent-light)] focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent-light)] text-[var(--foreground)] font-semibold py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={20} className="animate-spin" />
                    Mendaftar...
                  </span>
                ) : (
                  'Selesaikan Pendaftaran'
                )}
              </button>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[var(--surface-raised)]">Pendaftaran Berhasil!</h2>
              <p className="text-[var(--foreground-muted)]">
                Akun Anda telah berhasil dibuat. Silakan login untuk melanjutkan.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-[var(--foreground-muted)]">
                  <strong>Email:</strong> {email}
                </p>
                <p className="text-sm text-[var(--foreground-muted)] mt-2">
                  <strong>User ID:</strong> {userId}
                </p>
              </div>

              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent-light)] text-[var(--foreground)] font-semibold py-2 rounded-lg hover:shadow-lg transition"
              >
                Ke Halaman Login
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[var(--foreground-muted)] text-sm mt-6">
          Sudah punya akun?{' '}
          <a href="/login" className="text-[var(--accent-light)] font-semibold hover:text-[var(--accent-light)]">
            Login di sini
          </a>
        </p>
      </div>
    </div>
  );
}
