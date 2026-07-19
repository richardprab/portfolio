"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, X, Share2, Check, Linkedin } from "lucide-react";
import { siTelegram, siGithub } from "simple-icons/icons";
import { Annotation } from "../components/Annotation";
import { experiences, portfolioItems } from "../data/portfolio";
import { SUMMIT_ELEVATION } from "../components/three/camps";
import { useMounted } from "../hooks/useMounted";

// Constants
const RESUME_PATH = "/resume.pdf";
const RESUME_FILENAME = "Richard_Prabowo_Resume.pdf";
const TOAST_DURATION = 2000;
const FIRST_FIELD_YEAR = 2022;

export const ResumeSection = () => {
  const [isViewing, setIsViewing] = useState(false);
  const [showCopiedToast, setShowCopiedToast] = useState(false);

  const handleView = useCallback(() => {
    setIsViewing(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsViewing(false);
  }, []);

  const handleDownload = useCallback(() => {
    if (typeof document === "undefined") return;

    const link = document.createElement("a");
    link.href = RESUME_PATH;
    link.download = RESUME_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (showCopiedToast) {
      timeoutId = setTimeout(() => {
        setShowCopiedToast(false);
      }, TOAST_DURATION);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showCopiedToast]);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;

    const resumeUrl = `${window.location.origin}${window.location.pathname}#resume`;

    // Try Web Share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Richard Prabowo - Resume",
          text: "Check out my resume",
          url: resumeUrl,
        });
        return;
      } catch (err) {
        // User cancelled, exit gracefully
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (process.env.NODE_ENV === "development") {
          console.error("Share API error:", err);
        }
      }
    }

    // Fallback to clipboard
    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(resumeUrl);
        setShowCopiedToast(true);
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to copy to clipboard:", err);
        }
      }
    }
  }, []);

  const stats = [
    { label: "Elevation", value: `${SUMMIT_ELEVATION.toLocaleString("en-US")} m` },
    { label: "Sites surveyed", value: portfolioItems.length.toString().padStart(2, "0") },
    { label: "Route legs", value: experiences.length.toString().padStart(2, "0") },
    { label: "Years in the field", value: `${new Date().getFullYear() - FIRST_FIELD_YEAR}+` },
  ];

  return (
    <section id="resume" className="py-20 sm:py-28 relative z-0">
      <div className="max-w-7xl mx-auto">
        {/* No section header here: the summit is the crane shot's stage, and
            the register carries its own title. */}
        {/* The register, pinned to the summit flag. */}
        <Annotation anchorId="summit-register" side="right">
          <div className="summit-scrim">
            <p className="instrument text-accent mb-3">Summit register — sign out</p>

            <dl>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline gap-3 py-1.5 border-b border-line"
                >
                  <dt className="instrument text-secondary">{stat.label}</dt>
                  <span className="leader" aria-hidden="true" />
                  <dd className="font-mono text-sm text-primary">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <p className="text-secondary text-sm leading-relaxed mt-4 max-w-xs">
              You made the climb — sign out, take the dossier, and find me on
              the way down.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <button
                onClick={handleView}
                className="instrument flex items-center gap-2 px-4 py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="View resume"
              >
                <Eye className="w-4 h-4" />
                <span>View dossier</span>
              </button>

              <button
                onClick={handleDownload}
                className="instrument flex items-center gap-2 px-4 py-2.5 border border-line-strong text-primary hover:border-accent hover:text-accent transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Download resume PDF"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </button>
            </div>

            {/* The descent: this register is the end of the page. */}
            <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-line">
              <span className="instrument text-secondary">
                Descent via
              </span>
              <div className="flex items-center gap-4">
                {/* Share rides with the other ways off the mountain — as a
                    lone icon under the dossier buttons it looked stranded. */}
                <button
                  onClick={handleShare}
                  aria-label="Share resume link"
                  className="text-secondary hover:text-accent transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent pr-4 border-r border-line"
                >
                  <Share2 className="w-[18px] h-[18px]" />
                </button>
                <a
                  href="https://t.me/ltee_es"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="text-secondary hover:text-accent transition-colors duration-200"
                >
                  <svg role="img" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                    <path d={siTelegram.path} />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com/in/richard-prab"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="text-secondary hover:text-accent transition-colors duration-200"
                >
                  <Linkedin className="w-[18px] h-[18px]" />
                </a>
                <a
                  href="https://github.com/richardprab"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="text-secondary hover:text-accent transition-colors duration-200"
                >
                  <svg role="img" viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
                    <path d={siGithub.path} />
                  </svg>
                </a>
              </div>
            </div>
            <p className="instrument text-secondary mt-3">
              © {new Date().getFullYear()} R. Prabowo — surveyed on foot
            </p>
          </div>
        </Annotation>

        {/* Resume Viewer Modal */}
        <AnimatePresence>{isViewing && <ResumeViewer onClose={handleClose} />}</AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>{showCopiedToast && <Toast message="Link copied to clipboard" />}</AnimatePresence>
      </div>
    </section>
  );
};

// Toast Notification Component
interface ToastProps {
  message: string;
}

const Toast = ({ message }: ToastProps) => {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-[100] bg-background border border-line-strong px-5 py-3.5 flex items-center gap-3"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.25 }}
      role="status"
      aria-live="polite"
    >
      <Check className="w-4 h-4 text-accent" />
      <span className="instrument text-primary">{message}</span>
    </motion.div>
  );
};

// Resume Viewer Modal Component
interface ResumeViewerProps {
  onClose: () => void;
}

const ResumeViewer = ({ onClose }: ResumeViewerProps) => {
  const mounted = useMounted();

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  if (!mounted || typeof window === "undefined") {
    return null;
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        role="dialog"
        aria-modal="true"
        aria-label="Resume viewer"
      >
        <motion.div
          className="bg-background border border-line-strong w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col pointer-events-auto"
          initial={{ scale: 0.96, y: 16 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="instrument text-secondary flex items-center justify-between px-5 h-12 border-b border-line flex-none">
            <span>
              <span className="text-accent">Dossier</span> — R. Prabowo
            </span>
            <button
              onClick={onClose}
              aria-label="Close resume viewer"
              className="w-8 h-8 -mr-2 flex items-center justify-center text-secondary hover:text-primary border border-transparent hover:border-line transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden bg-white">
            <iframe
              src={`${RESUME_PATH}#view=FitH`}
              className="w-full h-full border-0"
              title="Resume PDF Viewer"
              aria-label="Resume document viewer"
              loading="lazy"
            />
          </div>
        </motion.div>
      </motion.div>
    </>,
    document.body
  );
};
