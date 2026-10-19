const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** "Today", "Tomorrow", "Yesterday", or "Mon, Aug 15" (adds year if not this year). */
export function formatDayLabel(iso: string) {
  const d = new Date(iso);
  const diffDays = Math.round((startOfDay(d) - startOfDay(new Date())) / DAY_MS);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== new Date().getFullYear() ? { year: "numeric" } : {}),
  });
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatTimeRange(startIso: string, endIso: string) {
  return `${formatClock(startIso)} – ${formatClock(endIso)}`;
}

/** "in 2h 15m", "in 3 days", "5m ago" — for countdowns and chat timestamps. */
export function formatRelative(iso: string, now = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const mins = Math.round(abs / 60000);
  let text: string;
  if (mins < 1) text = "now";
  else if (mins < 60) text = `${mins}m`;
  else if (mins < 60 * 24) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    text = m ? `${h}h ${m}m` : `${h}h`;
  } else {
    const days = Math.round(mins / (60 * 24));
    text = `${days} day${days === 1 ? "" : "s"}`;
  }
  if (text === "now") return "just now";
  return diff > 0 ? `in ${text}` : `${text} ago`;
}

/** Value for <input type="date"> / "time" from an ISO string, in local time. */
export function toDateInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toTimeInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Combine local date + time inputs into an ISO (UTC) string. */
export function fromDateTimeInputs(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

export function greetingForNow() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
