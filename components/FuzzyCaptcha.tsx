import { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FuzzyCaptchaProps {
  onSuccess: (token: string) => void;
  onFail?: () => void;
}

export default function FuzzyCaptcha({ onSuccess, onFail }: FuzzyCaptchaProps) {
  const [sliderValue, setSliderValue] = useState(0);
  const [targetPosition, setTargetPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random target position on mount
  useEffect(() => {
    generateNewChallenge();
  }, []);

  const generateNewChallenge = () => {
    const newTarget = Math.floor(Math.random() * 60) + 20; // Random between 20-80%
    setTargetPosition(newTarget);
    setSliderValue(0);
    setIsVerified(false);
    setAttempts(0);
  };

  const handleMouseDown = () => {
    if (isVerified) return; // Lock if already verified
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    if (!isDragging || isVerified) return; // Lock if already verified
    setIsDragging(false);
    checkVerification();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isVerified) return; // Lock if already verified
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Update immediately for smooth movement without delay
    setSliderValue(percentage);
  };

  const handleTouchStart = () => {
    if (isVerified) return; // Lock if already verified
    setIsDragging(true);
  };

  const handleTouchEnd = () => {
    if (!isDragging || isVerified) return; // Lock if already verified
    setIsDragging(false);
    checkVerification();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isVerified) return; // Lock if already verified
    if (!isDragging || !containerRef.current) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    // Update immediately for smooth movement
    setSliderValue(percentage);
  };

  const checkVerification = () => {
    const tolerance = 5; // 5% tolerance
    const isCorrect = Math.abs(sliderValue - targetPosition) <= tolerance;
    
    if (isCorrect) {
      setIsVerified(true);
      // Generate verification token (timestamp + random + position)
      const token = btoa(
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${targetPosition}`
      );
      onSuccess(token);
    } else {
      setAttempts(prev => prev + 1);
      if (attempts >= 2) {
        // After 3 failed attempts, generate new challenge
        setTimeout(() => {
          generateNewChallenge();
          if (onFail) onFail();
        }, 1000);
      } else {
        // Shake animation and reset
        setTimeout(() => {
          setSliderValue(0);
        }, 500);
      }
    }
  };

  return (
    <div className="space-y-3 p-3 md:p-4 bg-[var(--surface)] md:bg-gradient-to-br md:from-[var(--surface)] md:to-[var(--surface-raised)] rounded-lg md:rounded-xl border border-[var(--accent-border)] md:border-[var(--border)]">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-bold text-[var(--accent)] mb-1 flex items-center gap-2">
            {isVerified ? (
              <>
                <span className="text-green-400">✓</span> Verifikasi Berhasil!
              </>
            ) : (
              <>
                <span>🔒</span> Verifikasi Keamanan
              </>
            )}
          </p>
          <p className="text-xs text-[var(--foreground-muted)] leading-relaxed">
            {isVerified 
              ? "Captcha terverifikasi dengan sukses. Anda dapat melanjutkan." 
              : (
                <>
                  Seret <strong className="text-[var(--accent)]">slider biru</strong> ke area <strong className="text-yellow-400">target kuning bersinar</strong>
                </>
              )}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={generateNewChallenge}
          className="text-[var(--accent)] hover:text-[var(--accent-light)] hover:bg-[var(--accent-glow)] transition-all"
          title="Generate ulang captcha"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="relative pt-8">
        <div
          ref={containerRef}
          className={`relative h-16 md:h-20 rounded-lg border md:border-2 overflow-visible shadow md:shadow-lg transition-all ${
            isVerified 
              ? "bg-green-900/80 md:bg-gradient-to-r md:from-green-900/30 md:via-green-800/30 md:to-green-900/30 border-green-500/60 shadow-green-500/30 cursor-not-allowed" 
              : "bg-[var(--surface)] md:bg-gradient-to-r md:from-[var(--surface)] md:via-[var(--surface-raised)] md:to-[var(--surface)] border-[var(--accent)]/40 shadow-[var(--shadow-accent)] cursor-pointer hover:border-[var(--accent-border)]"
          }`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          title={isVerified ? "Captcha telah terverifikasi" : "Seret slider biru ke area target kuning"}
        >
        {/* Grid lines for reference */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex-1 border-r border-[var(--border)]/30"
              style={{ opacity: 0.3 }}
            />
          ))}
        </div>

        {/* Target position indicator with enhanced visibility - hide when verified */}
        {!isVerified && (
          <>
            <div
              className="absolute top-0 bottom-0 w-16 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent blur-sm md:blur-md animate-pulse hidden md:block"
              style={{ left: `${targetPosition}%`, transform: "translateX(-50%)" }}
            />
            <div
              className="absolute top-0 bottom-0 w-12 bg-gradient-to-r from-yellow-500/30 via-yellow-400/50 to-yellow-500/30"
              style={{ left: `${targetPosition}%`, transform: "translateX(-50%)" }}
            />
            <div
              className="absolute top-0 bottom-0 w-10 bg-gradient-to-r from-[var(--accent)]/40 via-[var(--accent-border)] to-[var(--accent)]/40 border-l-2 border-r-2 border-yellow-400"
              style={{ left: `${targetPosition}%`, transform: "translateX(-50%)" }}
            />
            
            {/* Target position marker at top with arrow */}
            <div
              className="absolute -top-6 flex flex-col items-center"
              style={{ left: `${targetPosition}%`, transform: "translateX(-50%)" }}
            >
              <span className="text-yellow-400 font-bold text-xs mb-1 drop-shadow-lg whitespace-nowrap bg-[var(--surface)] px-2 py-0.5 rounded">
                TARGET
              </span>
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-transparent border-t-yellow-400 animate-bounce" />
            </div>
            
            <div
              className="absolute top-1 h-3 w-3 bg-yellow-400 rounded-full border border-yellow-300 shadow-md md:shadow-lg shadow-yellow-400/50"
              style={{ left: `${targetPosition}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75 hidden md:block" />
            </div>
            
            {/* Bottom indicator */}
            <div
              className="absolute bottom-1 h-3 w-3 bg-yellow-400 rounded-full border border-yellow-300 shadow-md md:shadow-lg shadow-yellow-400/50"
              style={{ left: `${targetPosition}%`, transform: "translateX(-50%)" }}
            >
              <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-75 hidden md:block" />
            </div>
          </>
        )}

        {/* Puzzle pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="puzzle" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M20,0 L20,10 Q20,15 25,15 Q30,15 30,20 Q30,25 25,25 Q20,25 20,30 L20,40"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#puzzle)" />
          </svg>
        </div>

        {/* Success overlay when verified */}
        {isVerified && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 md:bg-green-500/10 rounded-lg md: animate-fade-in">
            <div className="flex items-center gap-2 bg-green-600/95 md:bg-green-600/90 px-3 md:px-4 py-1.5 md:py-2 rounded-full shadow-md md:shadow-lg animate-scale-in">
              <span className="text-[var(--foreground)] text-base md:text-lg font-bold">✓</span>
              <span className="text-[var(--foreground)] text-xs md:text-sm font-semibold">VERIFIED</span>
              <span className="text-[var(--foreground)] text-base md:text-lg">🔒</span>
            </div>
          </div>
        )}

        {/* Progress fill */}
        <div
          className={`absolute top-0 left-0 h-full transition-colors duration-300 ${
            isVerified
              ? "bg-gradient-to-r from-green-500/40 to-green-400/40"
              : attempts > 0
              ? "bg-gradient-to-r from-red-500/30 to-red-400/30 animate-pulse"
              : "bg-gradient-to-r from-[var(--accent)]/30 to-[var(--accent-light)]/30"
          }`}
          style={{ width: `${sliderValue}%` }}
        />

        {/* Slider handle with enhanced visibility */}
        <div
          ref={sliderRef}
          className={`absolute top-1/2 -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full transition-all duration-200 ${
            isVerified 
              ? "cursor-not-allowed opacity-90" 
              : isDragging 
              ? "cursor-grabbing scale-110 md:scale-125 shadow-xl md:shadow-2xl" 
              : "cursor-grab shadow-lg md:shadow-xl"
          } ${
            isVerified
              ? "bg-gradient-to-br from-green-400 to-green-600 border-2 md:border-4 border-green-300 shadow-green-400/50"
              : attempts > 0
              ? "bg-gradient-to-br from-red-400 to-red-600 border-2 md:border-4 border-red-300 shadow-red-400/50 animate-shake"
              : "bg-gradient-to-br from-[var(--accent)] via-[var(--accent-light)] to-[var(--accent-light)] border-2 md:border-4 border-[var(--accent-light)] shadow-[var(--accent-border)]"
          }`}
          style={{ 
            left: `${sliderValue}%`, 
            transform: "translate(-50%, -50%)",
            pointerEvents: isVerified ? "none" : "auto" // Disable pointer events when verified
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Glow effect - hidden on mobile for performance */}
          <div className={`absolute inset-0 rounded-full hidden md:block ${
            isVerified 
              ? "bg-green-400/30" 
              : attempts > 0 
              ? "bg-red-400/30" 
              : "bg-[var(--accent-glow)]"
          } blur-lg animate-pulse`} />
          
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {isVerified ? (
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[var(--foreground)] text-xl font-bold drop-shadow-lg animate-bounce">✓</span>
                <span className="text-[var(--foreground)] text-xs">🔒</span>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="w-7 h-1 bg-white rounded-full shadow-lg transition-all" />
                <div className="w-7 h-1 bg-white rounded-full shadow-lg transition-all" />
                <div className="w-7 h-1 bg-white rounded-full shadow-lg transition-all" />
              </div>
            )}
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 via-transparent to-transparent" />
        </div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-[var(--foreground-subtle)]">
        <span>0%</span>
        <span className={`font-semibold ${
          isVerified ? "text-green-400" : "text-[var(--accent)]"
        }`}>
          {Math.round(sliderValue)}%
        </span>
        <span>100%</span>
      </div>

      {attempts > 0 && !isVerified && (
        <p className="text-xs text-red-400 text-center">
          Tidak tepat. Coba lagi! ({3 - attempts} kesempatan tersisa)
        </p>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shake {
            0%, 100% { transform: translate(-50%, -50%) translateX(0); }
            25% { transform: translate(-50%, -50%) translateX(-5px); }
            75% { transform: translate(-50%, -50%) translateX(5px); }
          }
          .animate-shake {
            animation: shake 0.3s ease-in-out;
          }
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          @keyframes scale-in {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          .animate-scale-in {
            animation: scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
        `
      }} />
    </div>
  );
}
