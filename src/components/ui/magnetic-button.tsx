import * as React from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface MagneticButtonProps extends ButtonProps {
  magneticStrength?: number;
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className, magneticStrength = 0.35, ...props }, forwardedRef) => {
    const internalRef = React.useRef<HTMLButtonElement>(null);
    const resolvedRef = (forwardedRef || internalRef) as React.RefObject<HTMLButtonElement>;

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Spring damping tuned for high-precision physical tactile feel
    const springConfig = { stiffness: 280, damping: 20, mass: 0.8 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }
      const el = resolvedRef.current ?? e.currentTarget;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = (e.clientX - centerX) * magneticStrength;
      const distanceY = (e.clientY - centerY) * magneticStrength;
      mouseX.set(distanceX);
      mouseY.set(distanceY);
    };

    const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    return (
      <motion.div
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        <Button ref={resolvedRef} className={cn("transition-transform", className)} {...props}>
          {children}
        </Button>
      </motion.div>
    );
  },
);
MagneticButton.displayName = "MagneticButton";
