import confetti from "canvas-confetti";

// A burst from the checkbox she just ticked.
export function burstFrom(element: HTMLElement): void {
  const r = element.getBoundingClientRect();
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
    disableForReducedMotion: true,
  });
}

// Two seconds of confetti from both sides, for finishing everything.
export function bigCelebration(): void {
  const end = Date.now() + 2000;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
