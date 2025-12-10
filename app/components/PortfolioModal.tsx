"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import { PortfolioItem } from "../types";

interface PortfolioModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PortfolioModal = ({ item, isOpen, onClose }: PortfolioModalProps) => {
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

  if (!item) return null;

  const handleVideoLinkClick = () => {
    if (item.videoLink) {
      window.open(item.videoLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDemoLinkClick = () => {
    if (item.demoLink) {
      window.open(item.demoLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 cursor-pointer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Section */}
              {item.image && (
                <div className="relative w-full h-64 sm:h-80 bg-gray-200">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                </div>
              )}

              {/* Content Section */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {/* Header */}
                <div className="mb-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-black">
                    {item.title}
                  </h2>
                </div>

                {/* Description */}
                {item.description && (
                  <div className="mb-6">
                    <div className="text-gray-700 text-base sm:text-lg leading-relaxed">
                      {item.description.split('\n').map((line, idx) => (
                        <p key={idx} className="mb-2 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {item.technologies && item.technologies.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Technologies
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-full text-sm text-gray-700 bg-gray-100 border border-gray-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  {item.videoLink && (
                    <motion.button
                      onClick={handleVideoLinkClick}
                      className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
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
                      className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View More</span>
                    </motion.button>
                  )}
                  <motion.button
                    onClick={onClose}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer ${
                      item.videoLink || item.demoLink
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-black text-white hover:bg-gray-800"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Close</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

