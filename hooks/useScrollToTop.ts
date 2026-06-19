import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top immediately when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // Use instant instead of smooth to prevent any glitch
    });

    // Also scroll document element for better compatibility
    document.documentElement.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // Force scroll to top after a brief delay to ensure all content is loaded
    const timer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
      document.documentElement.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname]);
};
