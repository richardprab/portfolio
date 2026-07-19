"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ExternalLink, Play, X, Code } from "lucide-react";
import { PortfolioItem } from "../types";
import { usePortfolioItems } from "../hooks/usePortfolioItems";
import { useMounted } from "../hooks/useMounted";
import { CHECKPOINT_PROJECT_ID } from "./three/camps";

interface PortfolioModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const isGitHubLink = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === "github.com" || urlObj.hostname.includes("github");
  } catch {
    return false;
  }
};

export const PortfolioModal = ({ item, isOpen, onClose }: PortfolioModalProps) => {
  const mounted = useMounted();
  const { data: portfolioItems = [] } = usePortfolioItems();

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

  const handleVideoLinkClick = () => {
    if (item?.videoLink) {
      window.open(item.videoLink, "_blank", "noopener,noreferrer");
    }
  };

  const handleDemoLinkClick = () => {
    if (item?.demoLink) {
      window.open(item.demoLink, "_blank", "noopener,noreferrer");
    }
  };

  if (!mounted || typeof window === "undefined" || !item || !isOpen) {
    return null;
  }

  const siteIndex = portfolioItems.findIndex((p) => p.id === item.id);
  const siteNumber = (siteIndex === -1 ? 0 : siteIndex + 1).toString().padStart(2, "0");

  return createPortal(
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
              className="bg-background border border-line-strong max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Record header strip */}
              <div className="instrument text-secondary flex items-center justify-between px-5 sm:px-6 h-12 border-b border-line flex-none">
                <span>
                  <span className="text-accent">Site {siteNumber}</span>
                  <span aria-hidden="true"> — </span>
                  <span>Field record</span>
                  {item.id === CHECKPOINT_PROJECT_ID && (
                    <span className="text-accent"> — Checkpoint</span>
                  )}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Close record"
                  className="w-8 h-8 -mr-2 flex items-center justify-center text-secondary hover:text-primary border border-transparent hover:border-line transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Plate: full-colour specimen */}
                {item.image && (
                  <div className="p-5 sm:p-6 pb-0">
                    <div className="reg-ticks p-2">
                      <div className="relative w-full h-56 sm:h-72 border border-line">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 896px"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <h2 id="modal-title" className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight mb-4">
                    {item.title}
                  </h2>

                  {item.description && (
                    <div className="text-secondary text-sm sm:text-base leading-relaxed space-y-2 mb-6">
                      {item.description.split("\n").map((line, idx) =>
                        line.trim().length === 0 ? null : (
                          <p key={`description-${idx}`}>{line}</p>
                        )
                      )}
                    </div>
                  )}

                  {item.technologies && item.technologies.length > 0 && (
                    <div className="mb-6">
                      <h3 className="instrument text-secondary mb-3">Instruments used</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.technologies.map((tech, idx) => (
                          <span
                            key={`tech-${tech}-${idx}`}
                            className="instrument text-secondary border border-line px-2 py-1"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3 pt-5 border-t border-line">
                    {item.videoLink && (
                      <button
                        onClick={handleVideoLinkClick}
                        aria-label={isGitHubLink(item.videoLink) ? "View code repository" : "Watch video"}
                        className="instrument flex items-center gap-2 px-5 py-3 bg-foreground text-background hover:opacity-85 transition-opacity duration-200 cursor-pointer"
                      >
                        {isGitHubLink(item.videoLink) ? (
                          <>
                            <Code className="w-4 h-4" />
                            <span>View code</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Play footage</span>
                          </>
                        )}
                      </button>
                    )}
                    {item.demoLink && (
                      <button
                        onClick={handleDemoLinkClick}
                        aria-label="View more details"
                        className="instrument flex items-center gap-2 px-5 py-3 border border-line-strong text-primary hover:border-accent hover:text-accent transition-colors duration-200 cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open record</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};
