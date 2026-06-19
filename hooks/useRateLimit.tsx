import { useState, useEffect, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number; // Time window in milliseconds
  cooldownMs: number; // Cooldown period after hitting limit
}

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  blockedUntil: number;
}

export function useRateLimit(key: string, config: RateLimitConfig) {
  const [state, setState] = useState<RateLimitState>(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`rateLimit_${key}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { attempts: 0, lastAttempt: 0, blockedUntil: 0 };
      }
    }
    return { attempts: 0, lastAttempt: 0, blockedUntil: 0 };
  });

  const [timeLeft, setTimeLeft] = useState(0);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(state));
  }, [key, state]);

  // Update countdown timer
  useEffect(() => {
    if (state.blockedUntil > Date.now()) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, state.blockedUntil - Date.now());
        setTimeLeft(remaining);
        
        if (remaining === 0) {
          // Reset when cooldown expires
          setState(prev => ({
            ...prev,
            attempts: 0,
            blockedUntil: 0
          }));
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeLeft(0);
    }
  }, [state.blockedUntil]);

  const canAttempt = useCallback(() => {
    const now = Date.now();
    
    // Check if still in cooldown period
    if (state.blockedUntil > now) {
      return false;
    }

    // Check if window has expired (reset attempts)
    if (now - state.lastAttempt > config.windowMs) {
      if (state.attempts > 0) {
        setState(prev => ({
          ...prev,
          attempts: 0
        }));
      }
      return true;
    }

    // Check if under rate limit
    return state.attempts < config.maxAttempts;
  }, [state, config]);

  const attemptAction = useCallback(() => {
    const now = Date.now();
    
    if (!canAttempt()) {
      return false;
    }

    const newAttempts = state.attempts + 1;
    const shouldBlock = newAttempts >= config.maxAttempts;

    setState(prev => ({
      attempts: newAttempts,
      lastAttempt: now,
      blockedUntil: shouldBlock ? now + config.cooldownMs : prev.blockedUntil
    }));

    return true;
  }, [canAttempt, state.attempts, config]);

  const getRemainingAttempts = useCallback(() => {
    return Math.max(0, config.maxAttempts - state.attempts);
  }, [config.maxAttempts, state.attempts]);

  const getTimeUntilReset = useCallback(() => {
    if (state.blockedUntil > Date.now()) {
      return state.blockedUntil - Date.now();
    }
    if (state.attempts > 0) {
      const resetTime = state.lastAttempt + config.windowMs;
      return Math.max(0, resetTime - Date.now());
    }
    return 0;
  }, [state, config.windowMs]);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      lastAttempt: 0,
      blockedUntil: 0
    });
    setTimeLeft(0);
  }, []);

  return {
    canAttempt: canAttempt(),
    attemptAction,
    remainingAttempts: getRemainingAttempts(),
    timeUntilReset: getTimeUntilReset(),
    timeLeft,
    isBlocked: state.blockedUntil > Date.now(),
    reset,
    currentAttempts: state.attempts
  };
}
