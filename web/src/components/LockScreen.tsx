import { useState, type FormEvent, type ReactNode } from "react";

// "Sixth Street", "6th st.", "6 street", "the sixth", "6thst" -> all accepted.
export function isRightStreet(answer: string): boolean {
  const core = answer
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .replace(/^the/, "")
    .replace(/(street|st)$/, "");
  return ["6", "6th", "sixth"].includes(core);
}

// A playful gate, not real security: the answer ships in the page's JavaScript. It asks on
// every visit. The app behind it doesn't mount until it's opened, so the celebration (and
// the song's permission to play) starts from her unlock tap.
export function LockGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  return unlocked ? children : <LockScreen onUnlock={() => setUnlocked(true)} />;
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [answer, setAnswer] = useState("");
  const [wrong, setWrong] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [opening, setOpening] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (opening) return;
    if (isRightStreet(answer)) {
      setOpening(true);
      setTimeout(onUnlock, 700); // a beat to see the lock pop open
    } else {
      setWrong(true);
      setShaking(true);
    }
  }

  return (
    <div className="lock">
      <form
        className={shaking ? "lock-card shake" : "lock-card"}
        onSubmit={submit}
        onAnimationEnd={() => setShaking(false)}
      >
        <span className={opening ? "lock-icon open" : "lock-icon"} aria-hidden="true">
          {opening ? "🔓" : "🔒"}
        </span>
        <label className="lock-question" htmlFor="lock-answer">
          What is the name of the street where we met?
        </label>
        <input
          id="lock-answer"
          className="lock-input"
          value={answer}
          onChange={(e) => {
            setAnswer(e.currentTarget.value);
            setWrong(false);
          }}
          autoFocus
          autoComplete="off"
          aria-invalid={wrong}
          aria-describedby="lock-hint"
          placeholder="Type it here…"
        />
        <p id="lock-hint" className="lock-hint" aria-live="polite">
          {opening ? "Yay! Come on in 💕" : wrong ? "Not quite! Try again 💭" : " "}
        </p>
        <button type="submit" className="lock-button">
          Unlock 💌
        </button>
      </form>
    </div>
  );
}
