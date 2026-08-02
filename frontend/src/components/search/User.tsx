import { useState } from "react";

export type UserResultProps = {
  name: string;
  userId: string | number | null;
  location: string;
  avatarUrl: string;
  bio?: string;

  // Student fields
  institution?: string;
  major?: string;
  year?: string;

  // Professional / Career Switcher fields
  role?: string; // e.g. "Software Engineer", "Self-Taught Dev", "Pre-Med"
  company?: string; // e.g. "Amazon", "Freelance", "Looking for work"
  userType?: "student" | "professional" | "other";

  subjects?: string[];
  mode?: "online" | "in-person" | "hybrid";
  isSearching?: boolean;
  onConnect?: (userId: string | number | null) => void;
};

export default function UserResult({
  name,
  userId,
  location,
  avatarUrl,
  bio,
  institution,
  major,
  year,
  role,
  company,
  userType = "student",
  subjects = [],
  mode = "online",
  isSearching = true,
  onConnect,
}: UserResultProps) {
  const [imgError, setImgError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  // Build a smart subtitle based on whether they are a Student or Professional
  const academicOrProfessionalLine =
    userType === "professional" || role
      ? [role, company].filter(Boolean).join(" @ ") || "Professional"
      : [major, year, institution].filter(Boolean).join(" • ") || "Learner";

  const modeStyles = {
    online: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    "in-person": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    hybrid: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-zinc-700/80 hover:shadow-zinc-900/50">
      {/* Top Header Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with Status Indicator */}
          <div className="relative shrink-0">
            {!imgError && avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                onError={() => setImgError(true)}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-emerald-400 font-semibold text-lg shadow-inner">
                {initial}
              </div>
            )}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-zinc-900 ${
                isSearching ? "bg-white/80" : "bg-zinc-500"
              }`}
              title={
                isSearching ? "Actively looking for study partner" : "Away"
              }
            />
          </div>

          {/* Name & Role Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-zinc-100 truncate tracking-tight">
                {name}
              </h3>
              {userId && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                  #{userId}
                </span>
              )}
            </div>

            {/* Smart display for Student OR Professional */}
            <p className="text-xs text-zinc-400 truncate mt-0.5">
              {academicOrProfessionalLine}
            </p>
          </div>
        </div>

        {/* Study Mode Badge */}
        <span
          className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border capitalize ${
            modeStyles[mode] || modeStyles.online
          }`}
        >
          {mode}
        </span>
      </div>

      {/* Bio */}
      {bio && (
        <p className="mt-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
          {bio}
        </p>
      )}

      {/* Subject Badges */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3.5">
          {subjects.map((subject, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-800/80 text-emerald-400 border border-emerald-500/20 font-medium"
            >
              {subject}
            </span>
          ))}
        </div>
      )}

      {/* Card Footer: Location & Action */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5 truncate max-w-[60%]">
          <svg
            className="w-3.5 h-3.5 text-zinc-500 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{location || "Remote"}</span>
        </div>

        <button
          onClick={() => onConnect?.(userId)}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-colors shadow-sm active:scale-95"
        >
          Connect
        </button>
      </div>
    </div>
  );
}
