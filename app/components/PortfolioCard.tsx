"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { PortfolioItem } from "../types";
import { ANIMATION_DELAYS, EASING_CURVES } from "../config/animations";

interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
}

export const PortfolioCard = ({ item, index }: PortfolioCardProps) => (
  <motion.div
    className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden cursor-pointer group"
    initial={{ opacity: 0, y: 50, scale: 0.9 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ 
      duration: 0.6, 
      delay: index * ANIMATION_DELAYS.PORTFOLIO_ITEM,
      ease: EASING_CURVES.SMOOTH
    }}
    whileHover={{ 
      scale: 1.05,
      y: -5,
      transition: { duration: 0.3 }
    }}
  >
    {item.image ? (
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        onError={(e) => {
          e.currentTarget.src = '';
        }}
      />
    ) : (
      <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
        <span className="text-gray-600 text-sm">{item.title}</span>
      </div>
    )}
  </motion.div>
);

