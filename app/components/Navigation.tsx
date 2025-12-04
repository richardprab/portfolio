"use client";

import { motion } from "framer-motion";
import { NavItem } from "../types";
import { ANIMATION_DELAYS } from "../config/animations";

interface NavigationProps {
  items: NavItem[];
}

export const Navigation = ({ items }: NavigationProps) => (
  <header className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-4 sm:py-6 flex items-center justify-center">
    <nav aria-label="Main navigation" className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap justify-center">
      {items.map((item, index) => (
        <motion.a
          key={item.href}
          href={item.href}
          aria-label={`Navigate to ${item.label}`}
          className="text-black text-xs sm:text-sm font-medium hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 rounded"
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

