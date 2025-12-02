"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Home() {
  const navItems = ["Item 1", "Item 2", "Item 3", "Item 4"];
  const companyPlaceholders = [
    "Company A",
    "Company B",
    "Company C",
    "Company D",
    "Company E",
    "Company F",
  ];

  // Calculate scroll distance for seamless loop
  const scrollDistance = 120 * companyPlaceholders.length + 24 * (companyPlaceholders.length - 1);

  // Company badge component
  const CompanyBadge = ({ company }: { company: string }) => (
    <motion.div
      className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-100 rounded-full text-black text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
      whileHover={{ scale: 1.05, backgroundColor: "#e5e7eb" }}
    >
      {company}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-4 sm:py-6 flex items-center justify-center">
        <nav className="flex items-center gap-4 sm:gap-6 lg:gap-8 flex-wrap justify-center">
          {navItems.map((item, index) => (
            <motion.a
              key={item}
              href="#"
              className="text-black text-xs sm:text-sm font-medium hover:opacity-70 transition-opacity"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {item}
            </motion.a>
          ))}
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-8 lg:px-16 xl:px-24 pt-4 pb-8 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-7xl mx-auto min-h-[60vh] sm:min-h-[70vh]">
          {/* Left Side - Name Text at Bottom */}
          <div className="flex flex-col justify-end order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl xl:text-[11rem] font-thin text-black leading-none mb-2 sm:mb-4">
                Richard
              </h1>
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-9xl xl:text-[11rem] font-thin text-black leading-none"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                Prabowo
              </motion.h1>
            </motion.div>
          </div>

          {/* Right Side - Image at Top, Description Below */}
          <div className="flex flex-col items-end lg:items-end relative order-1 lg:order-2">
            <motion.div
              className="mb-4 sm:mb-6 relative w-[66.67%] max-w-lg lg:max-w-xl xl:max-w-2xl h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Image
                src="/profile-image.JPG"
                alt="Profile"
                fill
                className="object-cover rounded-lg"
                sizes="(max-width: 1024px) 66vw, (max-width: 1280px) 33vw, 22vw"
              />
            </motion.div>
            <motion.p
              className="text-black text-base sm:text-lg max-w-md text-right lg:absolute lg:bottom-0 leading-relaxed mt-4 lg:mt-0 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Hi! I&apos;m someone who loves to<br />
              code and creating intuitive<br />
              Digital Experiences.
            </motion.p>
          </div>
        </div>
      </main>

      {/* Bottom Section - Company Logos */}
      <section className="py-8 sm:py-12 overflow-hidden px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 sm:gap-6 overflow-hidden relative">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex items-center gap-4 sm:gap-6"
              animate={{
                x: [0, -scrollDistance],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...companyPlaceholders, ...companyPlaceholders].map((company, index) => (
                <CompanyBadge 
                  key={`company-${index}-${company}`} 
                  company={company}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
