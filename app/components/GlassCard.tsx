"use client";

import { ReactNode } from "react";
import { motion, MotionValue } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  yTransform?: MotionValue<number>;
  variant?: "white" | "colored";
  accentColor?: string;
  size?: "sm" | "md" | "lg";
}

export const GlassCard = ({
  children,
  className = "",
  yTransform,
  variant = "white",
  accentColor,
  size = "md",
}: GlassCardProps) => {
  const paddingClasses = {
    sm: "p-3 sm:p-4",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
  };

  const baseStyles = variant === "white" 
    ? "bg-white/90 dark:bg-white/90 backdrop-blur-lg border border-white/60 dark:border-white/60"
    : accentColor
    ? "bg-white/90 dark:bg-white/70 backdrop-blur-sm border border-gray-200 dark:border-gray-300"
    : "bg-white/90 dark:bg-white/90 backdrop-blur-lg border border-white/60 dark:border-white/60";

  const shadowStyles = variant === "white"
    ? "shadow-lg shadow-black/5"
    : "shadow-md shadow-black/5";

  const radiusClasses = size === "sm" ? "rounded-xl" : "rounded-2xl";

  const getAccentColorRGBA = (color: string, opacity: number) => {
    if (!color) return `rgba(0, 0, 0, ${opacity})`;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <motion.div
      style={yTransform ? { y: yTransform } : undefined}
      className={`
        ${baseStyles}
        ${shadowStyles}
        ${radiusClasses}
        ${paddingClasses[size]}
        ${className}
        relative overflow-hidden
        transition-all duration-300
      `}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: variant === "white"
            ? "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)"
            : accentColor
            ? `linear-gradient(135deg, ${getAccentColorRGBA(accentColor, 0.05)} 0%, rgba(255, 255, 255, 0.05) 100%)`
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)",
        }}
      />

      {variant === "colored" && accentColor && (
        <div
          className={`absolute -inset-[1px] ${radiusClasses} opacity-100 pointer-events-none blur-[2px] z-0`}
          style={{
            background: `linear-gradient(135deg, ${getAccentColorRGBA(accentColor, 0.3)}, ${getAccentColorRGBA(accentColor, 0.1)})`,
          }}
        />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

