"use client";

import { motion } from "framer-motion";

export const LoadingSpinner = () => {
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const spinnerVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const dotVariants = {
    initial: { y: 0, opacity: 0.3 },
    animate: {
      y: [-8, 0, -8],
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      role="status"
      aria-label="Loading content"
    >
      <motion.div
        className="relative w-16 h-16"
        variants={spinnerVariants}
      >
        {/* Outer rotating ring */}
        <motion.div
          className="absolute inset-0 border-4 border-gray-200 dark:border-gray-800 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Inner rotating ring with accent */}
        <motion.div
          className="absolute inset-2 border-4 border-transparent border-t-primary rounded-full"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Center pulsing dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Animated dots */}
      <motion.div 
        className="flex items-center gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-primary rounded-full"
            variants={dotVariants}
            animate="animate"
            transition={{
              delay: index * 0.2,
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

