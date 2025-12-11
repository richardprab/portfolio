"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Play, X } from "lucide-react";
import { PortfolioItem } from "../types";

interface PortfolioModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioModal = ({ item, isOpen, onClose }: PortfolioModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleVideoLinkClick = useCallback(() => {
    if (item?.videoLink) {
      window.open(item.videoLink, '_blank', 'noopener,noreferrer');
    }
  }, [item?.videoLink]);

  const handleDemoLinkClick = useCallback(() => {
    if (item?.demoLink) {
      window.open(item.demoLink, '_blank', 'noopener,noreferrer');
    }
  }, [item?.demoLink]);

  const modalContent = useMemo(() => {
    if (!item || !isOpen) return null;

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              aria-hidden="true"
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <motion.div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Image Section with Overlay Buttons */}
                <div className="relative w-full h-64 sm:h-80 bg-gray-200 dark:bg-gray-800">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 896px"
                    />
                  )}
                  
                  {/* Close Button Overlay */}
                  <div className="absolute top-4 right-4">
                    <motion.button
                      onClick={onClose}
                      aria-label="Close modal"
                      className="w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border border-white/60 dark:border-gray-700/60 text-black dark:text-gray-200 rounded-full cursor-pointer shadow-xl shadow-black/20 dark:shadow-white/10"
                      whileHover={{ 
                        scale: 1.05,
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                  {/* Header */}
                  <div className="mb-4">
                    <h2 id="modal-title" className="text-2xl sm:text-3xl font-bold text-primary">
                      {item.title}
                    </h2>
                  </div>

                {/* Description */}
                {item.description && (
                  <div className="mb-6">
                    <div className="text-tertiary text-base sm:text-lg leading-relaxed">
                      {item.description.split('\n').map((line, idx) => (
                        <p key={`description-${idx}`} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech, idx) => (
                        <span
                          key={`tech-${tech}-${idx}`}
                          className="px-3 py-1.5 rounded-full text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {item.videoLink && (
                    <motion.button
                      onClick={handleVideoLinkClick}
                      aria-label="Watch video"
                      className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="w-4 h-4" />
                      <span>Watch Video</span>
                    </motion.button>
                  )}
                  {item.demoLink && (
                    <motion.button
                      onClick={handleDemoLinkClick}
                      aria-label="View more details"
                      className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View More</span>
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }, [item, isOpen, onClose, handleVideoLinkClick, handleDemoLinkClick]);

  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return createPortal(modalContent, document.body);
};

