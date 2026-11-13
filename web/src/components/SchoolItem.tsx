import type { CSSProperties } from "react";
import { formatDate, isToday } from "../format";
import type { School } from "../types";

interface Props {
  school: School;
  painting: string;
  onToggle: (id: string, done: boolean, origin: HTMLElement) => void;
}

// One stop on the timeline: the date on the line, and a card with a Monet behind it.
export function SchoolItem({ school, painting, onToggle }: Props) {
  const today = !!school.interview_date && isToday(school.interview_date);

  let when = school.interview_date ? formatDate(school.interview_date) : "Date TBD";
  if (today) when = `Today · ${when}`;

  let status = "Coming up";
  if (school.done) status = school.done_at ? `Done ${formatDate(school.done_at)} ✓` : "Done ✓";
  else if (today) status = "Interview today";

  const classes = ["stop", school.done && "done", today && "today"].filter(Boolean).join(" ");

  return (
    <li className={classes}>
      <span className="stop-dot" aria-hidden="true" />
      <time className="stop-date" dateTime={school.interview_date}>
        {when}
      </time>
      <label className="stop-card" style={{ "--painting": `url("${painting}")` } as CSSProperties}>
        <input
          type="checkbox"
          checked={school.done}
          onChange={(e) => onToggle(school.id, e.currentTarget.checked, e.currentTarget)}
        />
        <span className="stop-text">
          <span className="stop-name">{school.name}</span>
          {school.full_name && <span className="stop-full">{school.full_name}</span>}
          <span className="stop-meta">{[school.location, status].filter(Boolean).join(" · ")}</span>
        </span>
      </label>
    </li>
  );
}
