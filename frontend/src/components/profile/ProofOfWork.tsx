import {
  FaGithub,
  FaMedium,
  FaDribbble,
  FaDev,
  FaKaggle,
  FaGlobe,
  FaExternalLinkAlt,
} from "react-icons/fa";

type ProofOfWorkProps = {
  proofs?: {
    github?: {
      username: string;
      topRepo?: string;
      stars?: number;
      url: string;
    };
    medium?: { username: string; articlesCount?: number; url: string };
    dribbble?: { username: string; url: string };
    devTo?: { username: string; url: string };
    kaggle?: { username: string; tier?: string; url: string };
    personalWebsite?: string;
  };
  featuredPosts?: Array<{
    id: string;
    platform: "Medium" | "GitHub" | "Dribbble" | "Dev.to" | "Kaggle";
    title: string;
    url: string;
    claps?: number;
    stars?: number;
    likes?: number;
    date: string;
  }>;
};

export default function ProofOfWorkSection({
  proofs,
  featuredPosts = [],
}: ProofOfWorkProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "github":
        return <FaGithub className="text-zinc-100" size={16} />;
      case "medium":
        return <FaMedium className="text-zinc-100" size={16} />;
      case "dribbble":
        return <FaDribbble className="text-pink-400" size={16} />;
      case "dev.to":
        return <FaDev className="text-zinc-100" size={16} />;
      case "kaggle":
        return <FaKaggle className="text-sky-400" size={16} />;
      default:
        return <FaGlobe className="text-emerald-400" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Connected Proof Profiles Grid */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Verified Proof of Work
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-500/10 text-emerald-400 border border-emerald-500/20">
            High Credibility
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {proofs?.github && (
            <a
              href={proofs.github.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FaGithub
                  className="text-zinc-300 group-hover:text-emerald-400 transition-colors"
                  size={18}
                />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">GitHub</p>
                  <p className="text-[10px] text-zinc-500">
                    @{proofs.github.username}
                  </p>
                </div>
              </div>
              {proofs.github.stars && (
                <span className="text-[10px] text-amber-400 font-mono">
                  ★ {proofs.github.stars}
                </span>
              )}
            </a>
          )}

          {proofs?.medium && (
            <a
              href={proofs.medium.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FaMedium
                  className="text-zinc-300 group-hover:text-emerald-400 transition-colors"
                  size={18}
                />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Medium</p>
                  <p className="text-[10px] text-zinc-500">
                    {proofs.medium.username}
                  </p>
                </div>
              </div>
              <FaExternalLinkAlt
                size={10}
                className="text-zinc-600 group-hover:text-zinc-400"
              />
            </a>
          )}

          {proofs?.dribbble && (
            <a
              href={proofs.dribbble.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FaDribbble
                  className="text-pink-400 group-hover:text-pink-300 transition-colors"
                  size={18}
                />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">
                    Dribbble
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    @{proofs.dribbble.username}
                  </p>
                </div>
              </div>
              <FaExternalLinkAlt
                size={10}
                className="text-zinc-600 group-hover:text-zinc-400"
              />
            </a>
          )}
        </div>
      </div>

      {/* 2. Featured Content / Articles / Repos */}
      {featuredPosts.length > 0 && (
        <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-100">
            Featured Content & Projects
          </h3>

          <div className="space-y-2.5">
            {featuredPosts.map((post) => (
              <a
                key={post.id}
                href={post.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/50 hover:border-zinc-700/80 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800">
                    {getPlatformIcon(post.platform)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors truncate">
                      {post.title}
                    </p>
                    <p className="text-[10px] text-zinc-500">
                      {post.platform} • {post.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {post.stars && (
                    <span className="text-[10px] font-mono text-amber-400">
                      ★ {post.stars}
                    </span>
                  )}
                  {post.claps && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      👏 {post.claps}
                    </span>
                  )}
                  {post.likes && (
                    <span className="text-[10px] font-mono text-pink-400">
                      ♥ {post.likes}
                    </span>
                  )}
                  <FaExternalLinkAlt
                    size={12}
                    className="text-zinc-600 group-hover:text-zinc-300 ml-1"
                  />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
