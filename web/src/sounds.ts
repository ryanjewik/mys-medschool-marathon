import tongueUrl from "./assets/yoshi-tongue.mp3";

const tongue = new Audio(tongueUrl);

// Plays when she ticks a box. Restarts if she ticks another before it finishes.
export function playTongue(): void {
  tongue.currentTime = 0;
  tongue.play().catch(() => {}); // a blocked or failed sound shouldn't break checking off
}
