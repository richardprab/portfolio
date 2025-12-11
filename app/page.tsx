"use client";

import { Navigation } from "./components/Navigation";
import { HeroSection } from "./sections/HeroSection";
import { SkillsSection } from "./sections/SkillsSection";
import { ExperienceSection } from "./sections/ExperienceSection";
import { PortfolioSection } from "./sections/PortfolioSection";
import { AnimatedBackground } from "./components/AnimatedBackground";
import { Footer } from "./components/Footer";
import { ThemeToggle } from "./components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black relative transition-colors duration-300">
      <AnimatedBackground />
      
      <Navigation />
      <div className="relative z-10 px-4 sm:px-8 lg:px-16 xl:px-24 pt-20 sm:pt-24">
      <HeroSection />
      <SkillsSection />
      <ExperienceSection />
      <PortfolioSection />
      </div>
      
      <Footer />
      <ThemeToggle />
    </div>
  );
}
