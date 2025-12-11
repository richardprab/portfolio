"use client";

import { useState } from "react";
import { SectionHeader } from "../components/SectionHeader";
import { PortfolioCard } from "../components/PortfolioCard";
import { PortfolioModal } from "../components/PortfolioModal";
import { usePortfolioItems } from "../hooks/usePortfolioItems";
import { PortfolioItem } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";

export const PortfolioSection = () => {
  const { data: portfolioItems = [], isLoading, error } = usePortfolioItems();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Delay clearing selected item to allow exit animation
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <section id="portfolio" className="py-12 sm:py-16 relative z-0">
    <div className="max-w-7xl mx-auto">
      <SectionHeader
        tag="Portfolio"
          title={<>Collection of projects<br />that showcase my work</>}
          description="A comprehensive showcase of my projects."
        />

        {isLoading && <LoadingSpinner />}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400">
              {error instanceof Error ? error.message : "Failed to load portfolio items"}
            </p>
          </div>
        )}
        
        {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {portfolioItems.map((item, index) => (
            <PortfolioCard
              key={item.id}
              item={item}
              index={index}
                onOpenModal={handleOpenModal}
            />
          ))}
        </div>
        )}
      </div>

      {/* Portfolio Modal */}
      <PortfolioModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
  </section>
);
};

