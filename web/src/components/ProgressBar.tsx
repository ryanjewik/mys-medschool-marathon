interface Props {
  done: number;
  total: number;
}

export function ProgressBar({ done, total }: Props) {
  const allDone = total > 0 && done === total;
  return (
    <section className="progress" aria-live="polite">
      <div className="bar" aria-hidden="true">
        <div className="bar-fill" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
      </div>
      <p id="progress-text">{allDone ? `All ${total} done!` : `${done} of ${total} done`}</p>
    </section>
  );
}
