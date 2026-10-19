import { useState } from "react";
import { FiCheck } from "react-icons/fi";
import type { SessionParticipant } from "../../hooks/useSessions";
import type { BuddyCard } from "../../types/buddy";

function Face({ name, src, className }: { name: string; src: string | null; className: string }) {
  const [broken, setBroken] = useState(false);
  if (src && !broken) {
    return (
      <img src={src} alt={name} title={name} onError={() => setBroken(true)} className={`${className} object-cover`} />
    );
  }
  return (
    <div
      title={name}
      className={`${className} bg-zinc-800 flex items-center justify-center text-[10px] font-semibold text-zinc-200`}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

/** Overlapping avatars like a group chat header. */
export function AvatarStack({ people, max = 4 }: { people: SessionParticipant[]; max?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex -space-x-2">
      {shown.map((p) => (
        <Face
          key={p.id}
          name={p.name}
          src={p.avatar_url}
          className="w-7 h-7 rounded-full border-2 border-zinc-900"
        />
      ))}
      {extra > 0 && (
        <div className="w-7 h-7 rounded-full border-2 border-zinc-900 bg-zinc-700 flex items-center justify-center text-[10px] text-zinc-200">
          +{extra}
        </div>
      )}
    </div>
  );
}

/** Toggleable buddy chips for picking who to invite. */
export function BuddyPicker({
  buddies,
  selected,
  onChange,
  disabledIds = [],
  max,
}: {
  buddies: BuddyCard[];
  selected: number[];
  onChange: (ids: number[]) => void;
  disabledIds?: number[];
  max: number;
}) {
  const toggle = (id: number) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
      {buddies.map((b) => {
        const already = disabledIds.includes(b.id);
        const isSel = selected.includes(b.id);
        const full = !isSel && selected.length >= max;
        return (
          <button
            key={b.id}
            type="button"
            disabled={already || full}
            onClick={() => toggle(b.id)}
            className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border text-xs transition disabled:opacity-40 ${
              isSel
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                : "bg-black/40 border-zinc-800 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <Face name={b.name} src={b.avatarUrl} className="w-6 h-6 rounded-full" />
            {b.name}
            {already ? (
              <span className="text-[10px] text-zinc-500">in session</span>
            ) : (
              isSel && <FiCheck className="w-3 h-3" />
            )}
          </button>
        );
      })}
    </div>
  );
}
