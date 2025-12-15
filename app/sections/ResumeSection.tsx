"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Eye, FileText, X, Share2, Check } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { SectionHeader } from "../components/SectionHeader";

// Constants
const RESUME_PATH = "/resume.pdf";
const RESUME_FILENAME = "Richard_Prabowo_Resume.pdf";
const TOAST_DURATION = 2000;
const BUTTON_ANIMATION = {
  whileHover: { scale: 1.05, y: -2 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring" as const, stiffness: 400, damping: 17 },
};

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
    const link = document.createElement("a");
    link.href = RESUME_PATH;
    link.download = RESUME_FILENAME;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleShare = useCallback(async () => {
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
        if ((err as Error).name === "AbortError") {
          return;
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(resumeUrl);
      setShowCopiedToast(true);
      setTimeout(() => setShowCopiedToast(false), TOAST_DURATION);
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
    }
  }, []);

  return (
    <section id="resume" className="py-12 sm:py-16 relative z-0">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Resume"
          title={<>Professional<br />Overview</>}
          description="A comprehensive overview of my skills, experience, and qualifications."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <GlassCard variant="white" size="lg" className="w-full">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
              {/* Left side - Icon/Visual */}
              <motion.div
                className="flex-shrink-0"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center border-4 border-white/60 dark:border-gray-700/60 shadow-xl shadow-black/10">
                  <FileText className="w-16 h-16 sm:w-20 sm:h-20 text-black dark:text-white" />
                </div>
              </motion.div>

              {/* Right side - Content and Actions */}
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-2xl sm:text-3xl font-bold text-black dark:text-black mb-3">
                  Download My Resume
                </h3>
                <p className="text-secondary text-base sm:text-lg mb-6 max-w-xl">
                  View my complete professional background, technical skills, and work experience in a downloadable format.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <motion.button
                    onClick={handleView}
                    className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200 cursor-pointer shadow-lg"
                    {...BUTTON_ANIMATION}
                    aria-label="View resume"
                  >
                    <Eye className="w-5 h-5" />
                    <span>View Resume</span>
                  </motion.button>

                  <motion.button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer shadow-lg border border-gray-200 dark:border-gray-700"
                    {...BUTTON_ANIMATION}
                    aria-label="Download resume PDF"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download PDF</span>
                  </motion.button>

                  <motion.button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer shadow-lg border border-gray-200 dark:border-gray-700"
                    {...BUTTON_ANIMATION}
                    aria-label="Share resume link"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Link</span>
                  </motion.button>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Resume Viewer Modal */}
        <AnimatePresence>
          {isViewing && <ResumeViewer onClose={handleClose} />}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {showCopiedToast && <Toast message="Link copied to clipboard!" />}
        </AnimatePresence>
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
      className="fixed bottom-6 right-6 z-[100] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center gap-3"
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
    >
      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
      <span className="text-black dark:text-white font-medium">{message}</span>
    </motion.div>
  );
};

// Resume Viewer Modal Component
interface ResumeViewerProps {
  onClose: () => void;
}

const ResumeViewer = ({ onClose }: ResumeViewerProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
          className="bg-white dark:bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col pointer-events-auto relative"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <motion.button
              onClick={onClose}
              aria-label="Close resume viewer"
              className="w-10 h-10 flex items-center justify-center bg-white/90 dark:bg-white/90 backdrop-blur-lg border border-white/60 dark:border-white/60 text-black dark:text-black rounded-full cursor-pointer shadow-xl shadow-black/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-100">
            <iframe
              src={`${RESUME_PATH}#view=FitH`}
              className="w-full h-full border-0"
              title="Resume PDF Viewer"
            />
          </div>
        </motion.div>
      </motion.div>
    </>,
    document.body
  );
};

