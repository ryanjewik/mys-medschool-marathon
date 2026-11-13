import { useEffect, useRef } from "react";
import finalCard from "../assets/final card.jpg";

interface Props {
  onClose: () => void;
}

// The surprise at the end: the card centred over a dimmed page. Clicking outside it, the ×,
// or Escape closes it. A plain overlay rather than <dialog>, whose top layer would sit above
// the cats; they're meant to stay on top of everything.
export function FinalCard({ onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden"; // no scrolling the page behind it
    return () => {
      removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Your card" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="modal-close" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <img
          src={finalCard}
          alt="Congrats on finishing interviews! So proud of you! Redeem your free DoorDash."
        />
      </div>
    </div>
  );
}
