import confetti from "canvas-confetti";
import { getConfig, listSchools, setDone } from "./api";
import type { AppConfig, School } from "./types";
import "./style.css";

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} is missing from index.html`);
  return el;
}

const els = {
  title: $("title"),
  barFill: $("bar-fill"),
  progressText: $("progress-text"),
  banner: $("banner"),
  list: $("schools"),
  toast: $("toast"),
};

interface Row {
  li: HTMLLIElement;
  box: HTMLInputElement;
  meta: HTMLSpanElement;
}

let config: AppConfig = {};
let schools: School[] = [];

// "2026-11-20" -> "Nov 20". Built from parts so it doesn't shift a day in US time zones.
function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Rows are built once, then updated in place, so the checkbox she just tapped
// (and keyboard focus) survives every re-render.
const rows = new Map<string, Row>();

function createRow(school: School): void {
  const li = document.createElement("li");
  li.className = "school";

  const label = document.createElement("label");

  const box = document.createElement("input");
  box.type = "checkbox";
  box.addEventListener("change", () => toggle(school, box));

  const text = document.createElement("span");
  text.className = "school-text";

  const name = document.createElement("span");
  name.className = "school-name";
  name.textContent = school.name;

  const meta = document.createElement("span");
  meta.className = "school-meta";

  text.append(name, meta);
  label.append(box, text);
  li.append(label);
  els.list.append(li);
  rows.set(school.id, { li, box, meta });
}

function updateRow(school: School): void {
  const { li, box, meta } = rows.get(school.id)!;
  li.classList.toggle("done", school.done);
  box.checked = school.done;
  if (school.done && school.done_at) meta.textContent = `Done ${formatDate(school.done_at)} ✓`;
  else if (school.interview_date) meta.textContent = `Interview ${formatDate(school.interview_date)}`;
  else meta.textContent = "";
}

function render(): void {
  const done = schools.filter((s) => s.done).length;
  const total = schools.length;
  const allDone = total > 0 && done === total;

  els.barFill.style.width = total ? `${(done / total) * 100}%` : "0%";
  els.progressText.textContent = allDone ? `All ${total} done!` : `${done} of ${total} done`;
  els.banner.hidden = !allDone;
  els.banner.textContent = allDone ? `🎉 ${config.finalMessage ?? "You did it!"}` : "";
  schools.forEach(updateRow);
}

function burstFrom(element: HTMLElement): void {
  const r = element.getBoundingClientRect();
  confetti({
    particleCount: 80,
    spread: 70,
    startVelocity: 35,
    origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight },
    disableForReducedMotion: true,
  });
}

function bigCelebration(): void {
  const end = Date.now() + 2000;
  (function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, disableForReducedMotion: true });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, disableForReducedMotion: true });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;
function showToast(message: string): void {
  els.toast.textContent = message;
  els.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    els.toast.hidden = true;
  }, 4000);
}

// Optimistic: update the screen right away, roll back if the save fails.
async function toggle(school: School, box: HTMLInputElement): Promise<void> {
  const done = box.checked;
  const before = { ...school };
  Object.assign(school, { done, done_at: done ? new Date().toISOString() : null });

  if (done) burstFrom(box);
  render();
  if (done && schools.every((s) => s.done)) bigCelebration();

  try {
    Object.assign(school, await setDone(school.id, done));
    els.toast.hidden = true; // clear any earlier "couldn't save" now that saving works
  } catch (err) {
    console.error(err);
    Object.assign(school, before);
    showToast("Couldn't save that. Check your connection and try again.");
  }
  render();
}

async function init(): Promise<void> {
  try {
    [config, schools] = await Promise.all([getConfig(), listSchools()]);
  } catch (err) {
    console.error(err);
    els.progressText.textContent = "Couldn't load the list. Try refreshing.";
    return;
  }
  if (config.herName) {
    els.title.textContent = `Congrats, ${config.herName}! 🩺`;
    document.title = `Congrats, ${config.herName}! 🩺`;
  }
  schools.forEach(createRow);
  render();
  if (schools.length && schools.every((s) => s.done)) bigCelebration();
}

init();
