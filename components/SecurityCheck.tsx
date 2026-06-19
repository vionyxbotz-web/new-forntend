import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurityCheckProps {
  isBlocked: boolean;
  timeLeft: number;
  remainingAttempts: number;
  maxAttempts: number;
  currentAttempts: number;
  onReset?: () => void;
  className?: string;
}

export default function SecurityCheck({
  isBlocked,
  timeLeft,
  remainingAttempts,
  maxAttempts,
  currentAttempts,
  onReset,
  className = ''
}: SecurityCheckProps) {
  const [displayTime, setDisplayTime] = useState('');

  useEffect(() => {
    if (timeLeft > 0) {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    } else {
      setDisplayTime('');
    }
  }, [timeLeft]);

  const getWarningLevel = () => {
    const usage = currentAttempts / maxAttempts;
    if (usage >= 1) return 'blocked';
    if (usage >= 0.8) return 'critical';
    if (usage >= 0.6) return 'warning';
    return 'safe';
  };

  const warningLevel = getWarningLevel();

  const warningStyles = {
    safe: {
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      text: 'text-green-400',
      icon: 'text-green-400'
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',  
      icon: 'text-yellow-400'
    },
    critical: {
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      text: 'text-orange-400',
      icon: 'text-orange-400'
    },
    blocked: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      icon: 'text-red-400'
    }
  };

  const styles = warningStyles[warningLevel];

  if (warningLevel === 'safe' && !isBlocked) {
    return null; // Don't show anything when everything is fine
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${styles.bg} ${styles.border} border rounded-lg p-3 sm:p-4 ${className}`}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <div className={`${styles.icon} mt-0.5 flex-shrink-0`}>
          {isBlocked ? (
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
            </motion.div>
          ) : (
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>
        
        <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
          <div className={`text-sm sm:text-base font-semibold ${styles.text}`}>
            {isBlocked ? '🚫 Akses Terblokir' : '⚠️ Peringatan Keamanan'}
          </div>
          
          <div className={`text-xs sm:text-sm ${styles.text} space-y-1`}>
            {isBlocked ? (
              <>
                <p>Anda telah mencapai batas maksimal percobaan ({maxAttempts}x).</p>
                {displayTime && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">Dapat mencoba lagi dalam: <strong>{displayTime}</strong></span>
                  </div>
                )}
              </>
            ) : (
              <>
                <p>
                  Anda telah menggunakan <strong>{currentAttempts}/{maxAttempts}</strong> percobaan.
                </p>
                <p>Sisa percobaan: <strong>{remainingAttempts}</strong></p>
                {warningLevel === 'critical' && (
                  <p className="font-medium text-xs sm:text-sm">⚠️ Hati-hati! Satu percobaan lagi akan memblokir akses Anda.</p>
                )}
              </>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[var(--surface-raised)] rounded-full h-1.5 sm:h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentAttempts / maxAttempts) * 100}%` }}
              transition={{ duration: 0.5 }}
              className={`h-1.5 sm:h-2 rounded-full ${
                warningLevel === 'blocked' ? 'bg-red-500' :
                warningLevel === 'critical' ? 'bg-orange-500' :
                warningLevel === 'warning' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
            />
          </div>

          {/* Tips */}
          <div className="text-[10px] sm:text-xs text-[var(--foreground-muted)] space-y-0.5 sm:space-y-1">
            <p>💡 <strong>Tips Keamanan:</strong></p>
            <ul className="ml-3 sm:ml-4 space-y-0.5 sm:space-y-1 list-disc">
              <li>Pastikan nomor WhatsApp yang dimasukkan benar</li>
              <li>Jangan mencoba nomor yang sudah terdaftar</li>
              <li>Tunggu beberapa saat jika mengalami error</li>
              {isBlocked && <li>Hubungi admin jika masalah berlanjut</li>}
            </ul>
          </div>

          {/* Reset Button (Admin only or after very long time) */}
          {onReset && isBlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 5 }} // Show after 5 seconds
            >
              <Button
                onClick={onReset}
                size="sm"
                variant="outline"
                className="mt-1.5 sm:mt-2 border-[var(--border-strong)] text-[var(--foreground-muted)] hover:bg-[var(--surface-raised)] text-xs sm:text-sm"
              >
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Reset (Admin)
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
