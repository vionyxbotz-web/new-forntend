import { memo } from "react";

// Lightweight static background fill (no blur, no animation loop)
// for Claymorphism performance requirements.
interface AnimatedBackgroundProps {
  color?: string;
}

const AnimatedBackground = memo(function AnimatedBackground({ color }: AnimatedBackgroundProps) {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: color || "var(--bg)",
      }}
    />
  );
});

export default AnimatedBackground;
