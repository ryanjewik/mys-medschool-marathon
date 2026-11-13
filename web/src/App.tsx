import { useEffect, useState } from "react";
import { getConfig, listSchools, setDone } from "./api";
import { bigCelebration, burstFrom } from "./confetti";
import { Cats } from "./components/Cats";
import { CelebrationMusic } from "./components/CelebrationMusic";
import { ProgressBar } from "./components/ProgressBar";
import { SchoolItem } from "./components/SchoolItem";
import { paintingFor } from "./paintings";
import { playTongue } from "./sounds";
import type { AppConfig, School } from "./types";

export default function App() {
  const [config, setConfig] = useState<AppConfig>({});
  const [schools, setSchools] = useState<School[] | null>(null); // null = still loading
  const [loadFailed, setLoadFailed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Load once. `cancelled` keeps StrictMode's dev-only double run from celebrating twice.
  useEffect(() => {
    let cancelled = false;
    Promise.all([getConfig(), listSchools()])
      .then(([cfg, list]) => {
        if (cancelled) return;
        setConfig(cfg);
        setSchools(list);
        if (list.length > 0 && list.every((s) => s.done)) bigCelebration();
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const title = config.herName ? `Congrats, ${config.herName}! 🩺` : "Congrats! 🩺";
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Optimistic: update the screen right away, roll back if the save fails.
  async function toggle(id: string, done: boolean, origin: HTMLElement) {
    if (!schools) return;
    const before = schools.find((s) => s.id === id)!;
    const replace = (school: School) => (list: School[] | null) =>
      list?.map((s) => (s.id === id ? school : s)) ?? list;

    setSchools(replace({ ...before, done, done_at: done ? new Date().toISOString() : null }));
    if (done) {
      playTongue();
      burstFrom(origin);
      if (schools.every((s) => (s.id === id ? done : s.done))) bigCelebration();
    }

    try {
      setSchools(replace(await setDone(id, done)));
      setToast(null); // clear any earlier "couldn't save" now that saving works
    } catch (err) {
      console.error(err);
      setSchools(replace(before));
      setToast("Couldn't save that. Check your connection and try again.");
    }
  }

  const doneCount = schools?.filter((s) => s.done).length ?? 0;
  const allDone = !!schools && schools.length > 0 && doneCount === schools.length;

  return (
    <>
      {allDone && (
        <>
          <CelebrationMusic />
          <Cats />
        </>
      )}

      <main>
        <section className="intro">
          <header>
            <p className="eyebrow">Med School Marathon</p>
            <h1>{title}</h1>
            <p className="lede">Check off each school as you finish it.</p>
          </header>

          {schools ? (
            <ProgressBar done={doneCount} total={schools.length} />
          ) : (
            <p id="progress-text" className="status">
              {loadFailed ? "Couldn't load the list. Try refreshing." : "Loading…"}
            </p>
          )}

          {allDone && (
            <p id="banner" className="banner">
              🎉 {config.finalMessage ?? "You did it!"}
            </p>
          )}
        </section>

        {schools && (
          <ol className="timeline">
            {schools.map((school, i) => (
              <SchoolItem key={school.id} school={school} painting={paintingFor(i)} onToggle={toggle} />
            ))}
          </ol>
        )}
      </main>

      {toast && (
        <p id="toast" className="toast" role="status">
          {toast}
        </p>
      )}
    </>
  );
}
