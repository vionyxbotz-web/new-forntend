/**
 * Error Handler Utility
 * Mengubah error teknis dari API jadi pesan yang user-friendly
 */

interface APIError {
  status?: number;
  message?: string;
  code?: string;
  body?: {
    error?: string;
    code?: string;
    message?: string;
  };
}

/**
 * Parse API error dan return pesan yang mudah dipahami user
 */
export function getErrorMessage(error: any): string {
  // Jika error adalah string langsung
  if (typeof error === 'string') {
    return cleanErrorMessage(error);
  }

  // Jika error message berupa string yang mengandung JSON legacy {error, code}
  if (typeof error?.message === 'string') {
    const extracted = extractLegacyErrorFromString(error.message);
    if (extracted?.error) {
      const patchedError: APIError = {
        status: error?.status,
        code: error?.code || extracted.code,
        message: extracted.error,
      };
      return getErrorMessage(patchedError);
    }
  }

  // Jika error adalah APIError object
  const apiError = error as APIError;
  
  // Extract error info
  const status = apiError.status;
  const code = apiError.code || apiError.body?.code;
  const message = apiError.message || apiError.body?.error || apiError.body?.message;

  // Handle berdasarkan status code
  if (status === 401 || code === 'UNAUTHENTICATED') {
    if (message?.toLowerCase().includes('email') || message?.toLowerCase().includes('password')) {
      return 'Email atau password salah. Silakan coba lagi.';
    }
    if (message?.toLowerCase().includes('captcha')) {
      return 'Kode captcha salah atau sudah kadaluarsa. Silakan coba lagi.';
    }
    if (message?.toLowerCase().includes('token') || message?.toLowerCase().includes('expired')) {
      return 'Sesi Anda telah berakhir. Silakan login ulang.';
    }
    return 'Email atau password salah.';
  }

  if (status === 403 || code === 'FORBIDDEN' || code === 'PERMISSION_DENIED') {
    if (code === 'USERNAME_MISMATCH') {
      return 'Akun Anda tidak memiliki akses untuk operasi ini.';
    }
    return 'Anda tidak memiliki izin untuk melakukan tindakan ini.';
  }

  if (status === 404 || code === 'NOT_FOUND') {
    return 'Data yang Anda cari tidak ditemukan.';
  }

  if (status === 429 || code === 'ACCOUNT_BLOCKED' || code === 'USER_RATE_LIMIT_EXCEEDED') {
    if (code === 'ACCOUNT_BLOCKED') {
      return 'Akun Anda diblokir sementara karena terlalu banyak percobaan. Silakan tunggu beberapa saat.';
    }
    if (code === 'USER_RATE_LIMIT_EXCEEDED') {
      return 'Anda telah mencapai batas maksimal. Silakan tunggu beberapa saat sebelum mencoba lagi.';
    }
    return 'Terlalu banyak percobaan. Silakan tunggu beberapa saat.';
  }

  if (status === 400 || code === 'INVALID_ARGUMENT') {
    if (message?.toLowerCase().includes('otp')) {
      return 'Kode OTP salah atau sudah kadaluarsa. Silakan periksa kembali.';
    }
    if (message?.toLowerCase().includes('phone') || message?.toLowerCase().includes('nomor')) {
      return 'Format nomor telepon tidak valid. Gunakan format: 62812xxxx';
    }
    if (message?.toLowerCase().includes('email')) {
      return 'Format email tidak valid.';
    }
    if (message?.toLowerCase().includes('password')) {
      return 'Password harus minimal 6 karakter.';
    }
    if (message?.toLowerCase().includes('captcha')) {
      return 'Kode verifikasi salah. Silakan coba lagi.';
    }
    if (message?.toLowerCase().includes('coin') || message?.toLowerCase().includes('saldo')) {
      return 'Saldo koin Anda tidak mencukupi.';
    }
    return 'Data yang Anda masukkan tidak valid. Silakan periksa kembali.';
  }

  if (status === 409 || code === 'ALREADY_EXISTS') {
    if (message?.toLowerCase().includes('email')) {
      return 'Email sudah terdaftar. Silakan gunakan email lain atau login.';
    }
    if (message?.toLowerCase().includes('username')) {
      return 'Username sudah digunakan. Silakan pilih username lain.';
    }
    if (message?.toLowerCase().includes('bot') || message?.toLowerCase().includes('nomor')) {
      return 'Nomor WhatsApp sudah terdaftar sebagai bot.';
    }
    return 'Data sudah ada di sistem.';
  }

  if (status === 500 || code === 'INTERNAL_ERROR') {
    return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
  }

  if (status === 503 || code === 'SERVICE_UNAVAILABLE') {
    return 'Layanan sedang tidak tersedia. Silakan coba lagi nanti.';
  }

  // Jika ada message yang readable, clean dan return
  if (message) {
    const cleaned = cleanErrorMessage(message);
    // Jika setelah di-clean masih ada JSON atau kode teknis, return fallback
    if (cleaned.includes('{') || cleaned.includes('status ') || cleaned.includes('code:')) {
      return 'Terjadi kesalahan. Silakan coba lagi.';
    }
    return cleaned;
  }

  // Default fallback
  return 'Terjadi kesalahan. Silakan coba lagi.';
}

/**
 * Clean error message dari kode teknis dan JSON
 */
function cleanErrorMessage(message: string): string {
  if (!message) return 'Terjadi kesalahan';

  // Remove technical prefixes
  let cleaned = message
    .replace(/^request failed:\s*/i, '')
    .replace(/^error:\s*/i, '')
    .replace(/^server error \(\d+\):\s*/i, '')
    .replace(/status \d+:\s*/gi, '');

  // Try to extract error message from JSON
  const extracted = extractLegacyErrorFromString(cleaned);
  if (extracted?.error) {
    cleaned = extracted.error;
  }

  // Remove remaining JSON artifacts
  cleaned = cleaned
    .replace(/\{.*?\}/g, '')
    .replace(/,"code":"[^"]*"/g, '')
    .replace(/\[.*?\]/g, '')
    .trim();

  // Capitalize first letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // If still looks technical, return fallback
  if (cleaned.length < 5 || /^[A-Z_]+$/.test(cleaned)) {
    return 'Terjadi kesalahan';
  }

  return cleaned || 'Terjadi kesalahan';
}

function extractLegacyErrorFromString(input: string): { error?: string; code?: string } | null {
  if (!input) return null;

  // Find first JSON object in the string
  const firstBrace = input.indexOf('{');
  const lastBrace = input.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;

  const candidate = input.slice(firstBrace, lastBrace + 1);
  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === 'object') {
      const err = typeof parsed.error === 'string' ? parsed.error : undefined;
      const code = typeof parsed.code === 'string' ? parsed.code : undefined;
      if (err || code) return { error: err, code };
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Get user-friendly title untuk error berdasarkan context
 */
export function getErrorTitle(error: any, defaultTitle: string = 'Terjadi Kesalahan'): string {
  const code = error?.code || error?.body?.code;
  const status = error?.status;

  if (status === 401 || code === 'UNAUTHENTICATED') {
    return 'Login Gagal';
  }

  if (status === 403 || code === 'FORBIDDEN') {
    return 'Akses Ditolak';
  }

  if (status === 404 || code === 'NOT_FOUND') {
    return 'Tidak Ditemukan';
  }

  if (status === 429 || code === 'ACCOUNT_BLOCKED') {
    return 'Terlalu Banyak Percobaan';
  }

  if (status === 400 || code === 'INVALID_ARGUMENT') {
    return 'Data Tidak Valid';
  }

  if (status === 409 || code === 'ALREADY_EXISTS') {
    return 'Data Sudah Ada';
  }

  if (status === 500 || code === 'INTERNAL_ERROR') {
    return 'Kesalahan Server';
  }

  return defaultTitle;
}

/**
 * Show toast dengan error handling otomatis
 */
export function showErrorToast(
  toast: any,
  error: any,
  defaultTitle?: string,
  defaultMessage?: string
) {
  const title = getErrorTitle(error, defaultTitle);
  const description = getErrorMessage(error) || defaultMessage;

  toast({
    title,
    description,
    variant: 'destructive',
  });
}
