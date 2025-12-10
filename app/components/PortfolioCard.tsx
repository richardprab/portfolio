"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { PortfolioItem } from "../types";
import { ANIMATION_DELAYS, EASING_CURVES } from "../config/animations";

interface PortfolioCardProps {
  item: PortfolioItem;
  index: number;
  onOpenModal: (item: PortfolioItem) => void;
}

export const PortfolioCard = ({ item, index, onOpenModal }: PortfolioCardProps) => {
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    onOpenModal(item);
  };

  return (
    <motion.article
      className="relative aspect-[4/3] bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
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
      onClick={handleCardClick}
    >
      {item.image && !imageError ? (
        <div className="relative w-full h-full">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={90}
            priority={index < 3}
            onError={() => {
              setImageError(true);
            }}
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
          <span className="text-gray-600 text-sm">{item.title}</span>
        </div>
      )}

      {/* Hover Overlay with Description and Tech Stack */}
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col justify-center items-center p-4 sm:p-6"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="text-center w-full"
          initial={{ y: 20, opacity: 0 }}
          whileHover={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <h3 className="text-white text-lg sm:text-xl font-bold mb-2">
            {item.title}
          </h3>
          
          {item.description && (
            <p className="text-gray-300 text-sm sm:text-base mb-4 line-clamp-2">
              {item.description}
            </p>
          )}

          {item.technologies && item.technologies.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-3">
              {item.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-full text-xs sm:text-sm text-white bg-white/20 backdrop-blur-sm border border-white/30"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          <p className="text-white/70 text-xs sm:text-sm mt-4 flex items-center justify-center gap-1.5">
            <span>Click to view more</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </p>
        </motion.div>
      </motion.div>
    </motion.article>
  );
};

