"use client";

import { motion } from "framer-motion";
import { ANIMATION_DELAYS } from "../config/animations";

const NAV_ITEMS = [
  { label: "Technical Skills", href: "#technical-skills" },
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
  <header className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-4 sm:py-6 flex items-center justify-center">
    <nav aria-label="Main navigation" className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap justify-center">
      {NAV_ITEMS.map((item, index) => (
        <motion.a
          key={item.href}
          href={item.href}
          onClick={(e) => handleNavClick(e, item.href)}
          aria-label={`Navigate to ${item.label}`}
          className="text-black text-sm sm:text-base font-medium focus:outline-none px-1 cursor-pointer transition-all duration-300 hover:text-gray-600 decoration-black hover:decoration-gray-600"
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

