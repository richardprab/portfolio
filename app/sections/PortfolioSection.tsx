"use client";

import { useState } from "react";
import Image from "next/image";
import { SectionHeader } from "../components/SectionHeader";
import { PortfolioModal } from "../components/PortfolioModal";
import { Annotation } from "../components/Annotation";
import { usePortfolioItems } from "../hooks/usePortfolioItems";
import { PortfolioItem } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAscentStore } from "../components/three/store";
import { focusedSiteId, getSiteAnchors } from "../components/three/anchors";
import { CHECKPOINT_PROJECT_ID } from "../components/three/camps";

// First sentence of the record, stripped of bullet markers, as the teaser.
const teaserOf = (description: string | undefined): string => {
  if (!description) return "";
  const firstLine = description.split("\n").find((l) => l.trim().length > 0) ?? "";
  return firstLine.replace(/^[\s•\-–]+/, "");
};

const setWaypointFocus = (id: string | null) => {
  useAscentStore.setState({ hoverProjectId: id });
};

const SiteRecord = ({
  item,
  index,
  onOpen,
}: {
  item: PortfolioItem;
  index: number;
  onOpen: (item: PortfolioItem) => void;
}) => {
  const [imageError, setImageError] = useState(false);
  const isCheckpoint = item.id === CHECKPOINT_PROJECT_ID;

  return (
    <div
      className="group cursor-pointer outline-none record-pop card-scrim"
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open field record for ${item.title}`}
    >
      <div className="instrument text-secondary flex items-center justify-between gap-4 mb-2.5">
        <span className="text-accent">Site {(index + 1).toString().padStart(2, "0")}</span>
        {isCheckpoint && (
          <span className="text-accent border border-accent/60 px-1.5 py-0.5">Checkpoint</span>
        )}
      </div>

      <div className="reg-ticks p-1.5 w-80 max-w-full">
        <div className="relative aspect-[16/10] overflow-hidden border border-line bg-line/10">
          {item.image && !imageError ? (
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover object-center grayscale contrast-[1.05] transition-all duration-500 group-hover:grayscale-0 group-focus-visible:grayscale-0"
              sizes="288px"
              quality={90}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="instrument text-secondary">{item.title}</span>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-primary text-xl font-semibold leading-snug mt-3">{item.title}</h3>
      <p className="text-secondary text-sm leading-relaxed line-clamp-2 mt-1.5 max-w-xs">
        {teaserOf(item.description)}
      </p>

      <div className="instrument flex items-center justify-between gap-4 mt-3 pt-2.5 border-t border-line max-w-xs">
        <span className="text-secondary truncate">
          {(item.technologies ?? []).slice(0, 3).join(" · ") || "—"}
        </span>
        <span className="text-secondary group-hover:text-accent transition-colors duration-300 flex-none">
          View record →
        </span>
      </div>
    </div>
  );
};

export const PortfolioSection = () => {
  const { data: portfolioItems = [], isLoading, error } = usePortfolioItems();
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const anchors = getSiteAnchors();

  // Which site the survey is looking at: hover/modal wins, scroll otherwise.
  const focusedId = useAscentStore(focusedSiteId);
  // The legend serves the high camps only — it clears the stage before the
  // summit crane shot.
  const legendOn = useAscentStore((s) => s.campT > 2.45 && s.campT < 3.45);

  const handleOpenModal = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
    // Hold the mountain's gaze on this project and dim the world behind the modal.
    useAscentStore.setState({ modalProjectId: item.id });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    useAscentStore.setState({ modalProjectId: null });
    // Delay clearing selected item to allow exit animation
    setTimeout(() => setSelectedItem(null), 300);
  };

  return (
    <section id="portfolio" className="py-20 sm:py-28 relative z-0">
      <div className="max-w-7xl mx-auto">
        {/* In the 3D experience the legend and the site records carry this
            camp — an in-flow header can't sync with the camera and slides
            through the Leg 04 → sites travel. Kept for small screens,
            no-WebGL and readers. */}
        <div className="anchored-hidden">
          <SectionHeader
            camp="Camp 03"
            designation="High Camps"
            elevation="1,980 m"
            title={
              <>
                Surveyed sites —<br />
                work worth documenting
              </>
            }
            blurb={`${portfolioItems.length} sites on short spurs off the main route — side quests to the career's climb. Trace the legend or keep ascending; open any record for the full field notes.`}
          />
        </div>

        {isLoading && <LoadingSpinner />}

        {error && (
          <div className="text-center py-12">
            <p className="instrument text-accent">
              {error instanceof Error ? error.message : "Failed to load survey records"}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Map legend: steers the camera and the focused callout. */}
            <ol
              className={`site-legend sticky top-24 max-w-xs space-y-0.5 transition-opacity duration-500 ${
                legendOn ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-label="Surveyed sites"
            >
              {portfolioItems.map((item, index) => {
                const isFocused = item.id === focusedId;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenModal(item)}
                      onMouseEnter={() => setWaypointFocus(item.id)}
                      onMouseLeave={() => setWaypointFocus(null)}
                      onFocus={() => setWaypointFocus(item.id)}
                      onBlur={() => setWaypointFocus(null)}
                      className={`instrument w-full text-left flex items-center gap-3 px-2 py-1.5 cursor-pointer transition-colors duration-200 border-l-2 ${
                        isFocused
                          ? "text-primary border-accent"
                          : "text-secondary border-transparent hover:text-primary"
                      }`}
                    >
                      <span className={isFocused ? "text-accent" : ""}>
                        {(index + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {/* The records themselves: anchored to their markers on the
                terrain, or stacked as a plain feed without WebGL. */}
            <div className="space-y-14 mt-4">
              {portfolioItems.map((item, index) => (
                <Annotation
                  key={item.id}
                  anchorId={`site-${item.id}`}
                  side={anchors[index]?.side ?? "right"}
                >
                  <SiteRecord item={item} index={index} onOpen={handleOpenModal} />
                </Annotation>
              ))}
            </div>
          </>
        )}
      </div>

      <PortfolioModal item={selectedItem} isOpen={isModalOpen} onClose={handleCloseModal} />
    </section>
  );
};
