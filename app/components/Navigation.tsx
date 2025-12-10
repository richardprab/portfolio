"use client";

import { motion } from "framer-motion";
import { ANIMATION_DELAYS } from "../config/animations";

const NAV_ITEMS = [
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Portfolio", href: "#portfolio" },
];

const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
  e.preventDefault();
  const element = document.querySelector(href);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const Navigation = () => (
  <header className="w-full py-5 sm:py-6 flex items-center justify-center">
    <nav aria-label="Main navigation" className="flex items-center gap-5 sm:gap-6 lg:gap-8 flex-wrap justify-center">
      {NAV_ITEMS.map((item, index) => (
        <motion.a
          key={item.href}
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          aria-label={`Navigate to ${item.label}`}
          className="text-black text-base sm:text-base font-medium focus:outline-none px-3 py-2 cursor-pointer transition-colors duration-300 hover:text-[#2563eb] touch-manipulation"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * ANIMATION_DELAYS.NAV_ITEM, duration: 0.5 }}
        >
          {item.label}
        </motion.a>
      ))}
    </nav>
  </header>
);

