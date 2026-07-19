"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ascentAudio } from "./ascentAudio";

// The expedition's sound: ON by default — the score is armed with the page
// (starting from the top each load) and actually sounds the moment the
// browser allows it, which for a fresh visitor is their first click or
// keypress (autoplay policy; nothing can sound before a gesture). Only an
// explicit mute is remembered as off. First-time visitors get a small hint
// so the armed music is discovered.
export const SoundToggle = () => {
  // The audio engine is the source of truth; React just mirrors it.
  const on = useSyncExternalStore(ascentAudio.subscribe, ascentAudio.getOn, () => false);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("ascent-sound");
    } catch {
      // No storage — behave like a first visit.
    }
    if (saved === "0") return; // explicitly muted last time

    // Arm the score now (it may sit suspended until a gesture) without
    // writing the preference — only the visitor's own toggle does that.
    ascentAudio.setOn(true, false);
    const kick = () => ascentAudio.kick();
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("keydown", kick, { once: true });

    let show: ReturnType<typeof setTimeout> | undefined;
    let hide: ReturnType<typeof setTimeout> | undefined;
    if (saved === null) {
      show = setTimeout(() => setHint(true), 2600);
      hide = setTimeout(() => setHint(false), 13000);
    }
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
      if (show !== undefined) clearTimeout(show);
      if (hide !== undefined) clearTimeout(hide);
    };
  }, []);

  const handleToggle = () => {
    setHint(false);
    ascentAudio.toggle();
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
      {hint && (
        <span className="sound-hint instrument" aria-hidden="true">
          The climb has music
        </span>
      )}
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={on}
        aria-label={on ? "Mute expedition sound" : "Enable expedition sound"}
        data-hint={hint ? "1" : "0"}
        className="w-10 h-10 flex items-center justify-center border border-line text-secondary hover:text-accent hover:border-accent/60 bg-background/40 backdrop-blur-[2px] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent data-[hint=1]:border-accent/70 data-[hint=1]:text-accent"
      >
        {on ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );
};
