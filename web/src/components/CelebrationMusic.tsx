import { useEffect } from "react";
import renaiUrl from "../assets/renai.mp4";

// Loops the song (just the audio of renai.mp4) once every school is checked off.
// Browsers only allow sound right after a tap, so when she ticks the last box it starts
// straight away. If she opens the page with everything already done, it waits for her
// first tap or key press.
export function CelebrationMusic() {
  useEffect(() => {
    const song = new Audio(renaiUrl);
    song.loop = true;
    let stopped = false;
    const start = () => {
      song.play().catch(() => {});
    };

    song.play().catch(() => {
      // pause() below also rejects a pending play(); don't queue a restart for a song we stopped.
      if (stopped) return;
      addEventListener("pointerdown", start, { once: true });
      addEventListener("keydown", start, { once: true });
    });

    return () => {
      stopped = true;
      song.pause();
      removeEventListener("pointerdown", start);
      removeEventListener("keydown", start);
    };
  }, []);

  return null;
}
