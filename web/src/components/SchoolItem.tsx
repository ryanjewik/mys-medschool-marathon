import { formatDate } from "../format";
import type { School } from "../types";

interface Props {
  school: School;
  onToggle: (id: string, done: boolean, origin: HTMLElement) => void;
}

export function SchoolItem({ school, onToggle }: Props) {
  let meta = "";
  if (school.done && school.done_at) meta = `Done ${formatDate(school.done_at)} ✓`;
  else if (school.interview_date) meta = `Interview ${formatDate(school.interview_date)}`;

  return (
    <li className={school.done ? "school done" : "school"}>
      <label>
        <input
          type="checkbox"
          checked={school.done}
          onChange={(e) => onToggle(school.id, e.currentTarget.checked, e.currentTarget)}
        />
        <span className="school-text">
          <span className="school-name">{school.name}</span>
          <span className="school-meta">{meta}</span>
        </span>
      </label>
    </li>
  );
}
