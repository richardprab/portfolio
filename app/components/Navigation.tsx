"use client";

import { motion } from "framer-motion";
import { ANIMATION_DELAYS } from "../config/animations";

const NAV_ITEMS = [
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Resume", href: "#resume" },
];

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  if (href === "#home" || href === "#") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const Navigation = () => (
  <header className="fixed top-0 left-0 right-0 z-40 w-full py-4 sm:py-5 backdrop-blur-sm bg-white/70 dark:bg-black/70">
    <nav aria-label="Main navigation" className="flex items-center justify-center gap-5 sm:gap-6 lg:gap-8 max-w-7xl mx-auto px-4 sm:px-8">
      <motion.a
        href="#home"
        onClick={(e) => handleNavClick(e, "#home")}
        aria-label="Navigate to home"
        className="text-primary text-base sm:text-base font-medium focus:outline-none px-3 py-2 cursor-pointer transition-colors duration-300 hover:text-[#2563eb] dark:hover:text-blue-400 touch-manipulation"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0, duration: 0.5 }}
      >
        Home
      </motion.a>
      
      {NAV_ITEMS.map((item, index) => (
        <motion.a
          key={item.href}
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          aria-label={`Navigate to ${item.label}`}
          className="text-primary text-base sm:text-base font-medium focus:outline-none px-3 py-2 cursor-pointer transition-colors duration-300 hover:text-[#2563eb] dark:hover:text-blue-400 touch-manipulation"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (index + 1) * ANIMATION_DELAYS.NAV_ITEM, duration: 0.5 }}
        >
          {item.label}
        </motion.a>
      ))}
    </nav>
  </header>
);

