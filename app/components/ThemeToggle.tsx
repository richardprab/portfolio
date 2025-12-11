"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../providers/ThemeProvider";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-[100] w-10 h-20 rounded-full bg-gray-300 dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-between p-1"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      <motion.div
        className={`absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full shadow-md backdrop-blur-md ${
          isDark ? "bg-black/90" : "bg-white/90"
        }`}
        animate={{
          y: isDark ? 40 : 0,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <Sun className={`absolute top-[12px] left-1/2 -translate-x-1/2 w-4 h-4 z-10 ${isDark ? "text-secondary" : "text-primary"}`} />
      <Moon className={`absolute top-[52px] left-1/2 -translate-x-1/2 w-4 h-4 z-10 ${isDark ? "text-primary" : "text-secondary"}`} />
    </motion.button>
  );
};

