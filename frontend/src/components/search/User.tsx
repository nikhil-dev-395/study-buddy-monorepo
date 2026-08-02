import { useState } from "react";

type UserResultProps = {
  name: string;
  userId: string | number | null;
  location: string;
  avatarUrl: string;
};

export default function UserResult({
  name,
  userId,
  location,
  avatarUrl,
}: UserResultProps) {
  const [imgError, setImgError] = useState(false);

  // Fallback initial if image fails or isn't available
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="w-full max-w-sm mx-auto mt-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:border-zinc-700 hover:shadow-zinc-900/40">
      <div className="flex items-center gap-4">
        {/* Avatar with Glow & Ring */}
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
          {/* Active status indicator dot */}
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900" />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-zinc-100 truncate tracking-tight">
              {name}
            </h3>
            {userId && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                #{userId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400">
            {/* Location Icon */}
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
            <span className="truncate">{location || "Unknown location"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
