"use client";

import { SectionHeader } from "../components/SectionHeader";
import { PortfolioCard } from "../components/PortfolioCard";
import { PortfolioItem } from "../types";

interface PortfolioSectionProps {
  portfolioItems: PortfolioItem[];
}

export const PortfolioSection = ({ portfolioItems }: PortfolioSectionProps) => (
  <section className="py-12 sm:py-16 bg-white">
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        tag="Portfolio"
        title="Explore my portfolio of creative solutions"
        description="Explore my portfolio full of creative solutions."
      />

      <div className="px-4 sm:px-8 lg:px-16 xl:px-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {portfolioItems.map((item, index) => (
            <PortfolioCard
              key={item.id}
              item={item}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  </section>
);

