"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { ascentAudio } from "./ascentAudio";

// The expedition's sound: ON by default — the score is armed with the page
// (starting from the top each load) and actually sounds the moment the
// browser allows it. Autoplay policy requires a genuine user gesture; on
// this site that gesture is usually just SCROLLING, and scroll (wheel/touch)
// does NOT count as a gesture in most browsers — so the site's primary,
// often only, interaction was silently unable to ever start the music. Every
// plausible gesture is wired here as a belt-and-suspenders set; the hint
// stays up until the engine is actually confirmed audible, not on a blind
// timer, so it doesn't vanish before a scroll-only visitor notices it.
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
    // pointerdown/keydown are the reliable, spec-safe gestures; wheel and
    // touchstart are best-effort (some browsers honor them for audio
    // unlock even though they aren't "sticky activation" events) — free
    // wins that cost nothing if a browser ignores them.
    const gestures: Array<[string, AddEventListenerOptions]> = [
      ["pointerdown", { once: true }],
      ["keydown", { once: true }],
      ["touchstart", { once: true, passive: true }],
      ["wheel", { once: true, passive: true }],
    ];
    for (const [type, opts] of gestures) window.addEventListener(type, kick, opts);

    let show: ReturnType<typeof setTimeout> | undefined;
    let poll: ReturnType<typeof setInterval> | undefined;
    let maxHide: ReturnType<typeof setTimeout> | undefined;
    if (saved === null) {
      show = setTimeout(() => setHint(true), 2600);
      // Clear the hint the moment sound is actually audible, not on a
      // guess — a scroll-only visitor should keep seeing it until it's
      // truly earned its exit. A hard cap still retires it eventually.
      poll = setInterval(() => {
        if (!ascentAudio.isAudible()) return;
        setHint(false);
        if (poll !== undefined) clearInterval(poll);
      }, 500);
      maxHide = setTimeout(() => setHint(false), 30000);
    }
    return () => {
      for (const [type, opts] of gestures) window.removeEventListener(type, kick, opts);
      if (show !== undefined) clearTimeout(show);
      if (poll !== undefined) clearInterval(poll);
      if (maxHide !== undefined) clearTimeout(maxHide);
    };
  }, []);

  const handleToggle = () => {
    setHint(false);
    // The engine can be "on" (armed) but still silently suspended — a
    // visitor who has never actually HEARD anything shouldn't have their
    // first click read as mute. Only toggle off if it was truly audible.
    const wasAudible = ascentAudio.isAudible();
    const wasOn = ascentAudio.isOn();
    if (!wasOn) ascentAudio.setOn(true);
    else if (wasAudible) ascentAudio.toggle();
    else ascentAudio.kick();
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
