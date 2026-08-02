import { useState } from "react";
import { CiLocationOn, CiClock1, CiPaperplane, CiGlobe } from "react-icons/ci";
import { MdCalendarToday, MdSubject } from "react-icons/md";

import {
  FaGithub,
  FaLinkedin,
  FaDiscord,
  FaMedium,
  FaDribbble,
  FaDev,
  FaKaggle,
  FaExternalLinkAlt,
  FaNetworkWired,
} from "react-icons/fa";

// Dummy profile data matching our extended schema
const sampleProfile = {
  id: "usr_9182",
  name: "Alex Rivera",
  username: "alexrivera_dev",
  avatarUrl:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  location: "San Francisco, CA",
  bio: "CS Junior passionate about System Design & High-Performance Computing. Currently grinding LeetCode Mediums and preparing for AWS Cloud Solutions Architect.",
  userType: "student" as const,
  academicDetails: {
    institution: "Stanford University",
    major: "Computer Science",
    year: "Junior",
  },
  status: {
    isSearching: true,
    lastActive: "10 mins ago",
  },
  studyPreferences: {
    mode: "hybrid" as const,
    timeZone: "PST (UTC-8)",
    availability: ["Mon/Wed/Fri - Evenings", "Sat - All Day"],
    learningStyle: "Active Recall & Mock Technical Interviews",
  },
  skills: {
    learning: ["System Design", "Kubernetes", "AWS Architect"],
    teaching: ["Data Structures", "TypeScript", "Python / FastAPI"],
  },
  workExperience: [
    {
      role: "Frontend Developer Intern",
      company: "Vercel",
      duration: "Jun 2025 - Sep 2025",
      description:
        "Worked on Next.js documentation and component accessibility optimizations.",
    },
  ],
  proofOfWork: {
    github: {
      username: "alexrivera",
      topRepo: "distributed-cache-go",
      stars: 142,
      url: "https://github.com",
    },
    medium: {
      username: "@alexrivera_cs",
      articlesCount: 5,
      url: "https://medium.com",
    },
    dribbble: { username: "alex_design", url: "https://dribbble.com" },
    devTo: { username: "alexrivera", url: "https://dev.to" },
    kaggle: {
      username: "alexrivera_ml",
      tier: "Expert",
      url: "https://kaggle.com",
    },
    personalWebsite: "https://alexrivera.dev",
  },
  featuredPosts: [
    {
      id: "post_1",
      platform: "Medium" as const,
      title: "Understanding Consistent Hashing in Distributed Systems",
      url: "https://medium.com",
      claps: 320,
      date: "Jul 2026",
    },
    {
      id: "post_2",
      platform: "GitHub" as const,
      title: "distributed-cache-go (Open Source Redis Clone)",
      url: "https://github.com",
      stars: 142,
      date: "Jun 2026",
    },
    {
      id: "post_3",
      platform: "Dribbble" as const,
      title: "Minimalist Study Buddy UI Design System",
      url: "https://dribbble.com",
      likes: 89,
      date: "May 2026",
    },
  ],
  socials: {
    github: "https://github.com",
    linkedin: "https://linkedin.com",
    discord: "alex_cs#1234",
  },
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"about" | "proof">("about");
  const [imgError, setImgError] = useState(false);

  const user = sampleProfile;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : "?";

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
        return <CiGlobe className="text-emerald-400" size={16} />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* 1. Profile Header Card */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with Status Ring */}
          <div className="relative shrink-0">
            {!imgError && user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                onError={() => setImgError(true)}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-emerald-400 font-bold text-3xl shadow-inner">
                {initial}
              </div>
            )}
            <span
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full ring-4 ring-zinc-900 ${
                user.status.isSearching ? "bg-emerald-500" : "bg-zinc-500"
              }`}
              title={
                user.status.isSearching
                  ? "Actively looking for study partner"
                  : "Away"
              }
            />
          </div>

          {/* User Meta */}
          <div className="flex-1 text-center sm:text-left min-w-0 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
                    {user.name}
                  </h1>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified Learner
                  </span>
                </div>
                <p className="text-sm text-zinc-400 font-mono mt-0.5">
                  @{user.username}
                </p>
              </div>

              {/* Primary Connect CTA */}
              <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs transition-all active:scale-95 shadow-md">
                <CiPaperplane size={16} />
                Send Study Request
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-sm text-zinc-300 font-medium">
              {[
                user.academicDetails?.major,
                user.academicDetails?.year,
                user.academicDetails?.institution,
              ]
                .filter(Boolean)
                .join(" • ")}
            </p>

            {/* Location & Status Info */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <CiLocationOn className="text-zinc-500" size={16} />
                {user.location}
              </span>
              <span className="flex items-center gap-1">
                <CiClock1 className="text-zinc-500" size={16} />
                Active {user.status.lastActive}
              </span>
              <span className="capitalize px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
                {user.studyPreferences.mode} mode
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2 text-zinc-400">
              {user.socials?.github && (
                <a
                  href={user.socials.github}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  <FaGithub size={18} />
                </a>
              )}
              {user.socials?.linkedin && (
                <a
                  href={user.socials.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  <FaLinkedin size={18} />
                </a>
              )}
              {user.socials?.discord && (
                <span className="flex items-center gap-1.5 text-xs bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/50">
                  <FaDiscord className="text-indigo-400" size={14} />
                  {user.socials.discord}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              About Me
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{user.bio}</p>
          </div>
        )}
      </div>

      {/* 2. Proof of Work Highlights Grid */}
      <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Verified Portfolios & Profiles
          </h3>
          <span className="text-[11px] text-zinc-500">5 Accounts Linked</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {user.proofOfWork.github && (
            <a
              href={user.proofOfWork.github.url}
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
                    @{user.proofOfWork.github.username}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">
                ★ {user.proofOfWork.github.stars}
              </span>
            </a>
          )}

          {user.proofOfWork.medium && (
            <a
              href={user.proofOfWork.medium.url}
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
                    {user.proofOfWork.medium.username}
                  </p>
                </div>
              </div>
              <FaExternalLinkAlt
                size={10}
                className="text-zinc-600 group-hover:text-zinc-400"
              />
            </a>
          )}

          {user.proofOfWork.dribbble && (
            <a
              href={user.proofOfWork.dribbble.url}
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
                    @{user.proofOfWork.dribbble.username}
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

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
        <button
          onClick={() => setActiveTab("about")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "about"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Study Specs & Work
        </button>
        <button
          onClick={() => setActiveTab("proof")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "proof"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Articles & Work Proofs ({user.featuredPosts.length})
        </button>
      </div>

      {/* 4. Tab Views */}
      {activeTab === "about" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Matrix */}
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <MdSubject className="text-emerald-400" size={18} />
              Skills & Subjects
            </h3>

            <div>
              <p className="text-xs text-zinc-400 mb-2">
                wants to learn / practice:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.learning.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-400 mb-2">
                can teach / help with:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.teaching.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Availability & Learning Style */}
          <div className="rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <MdCalendarToday className="text-emerald-400" size={18} />
              Study Availability & Style
            </h3>

            <div>
              <p className="text-xs text-zinc-400 mb-1">Time Zone & Hours</p>
              <p className="text-xs text-zinc-200 font-medium">
                {user.studyPreferences.timeZone}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {user.studyPreferences.availability.map((a, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-zinc-400 mb-1">Learning Approach</p>
              <p className="text-xs text-zinc-300 italic">
                {user.studyPreferences.learningStyle}
              </p>
            </div>
          </div>

          {/* Work / Project History */}
          <div className="md:col-span-2 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FaNetworkWired className="text-emerald-400" size={18} />
              Work & Internship History
            </h3>

            <div className="space-y-3">
              {user.workExperience.map((work, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/50 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-100">
                      {work.role}{" "}
                      <span className="text-emerald-400">@ {work.company}</span>
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {work.duration}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {work.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Proof of Work Featured Articles / Repos Tab */
        <div className="space-y-3">
          {user.featuredPosts.map((post) => (
            <a
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 shrink-0">
                  {getPlatformIcon(post.platform)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-100 group-hover:text-emerald-400 transition-colors truncate">
                    {post.title}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {post.platform} • Published {post.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-2">
                {post.stars && (
                  <span className="text-xs font-mono text-amber-400">
                    ★ {post.stars}
                  </span>
                )}
                {post.claps && (
                  <span className="text-xs font-mono text-emerald-400">
                    👏 {post.claps}
                  </span>
                )}
                {post.likes && (
                  <span className="text-xs font-mono text-pink-400">
                    ♥ {post.likes}
                  </span>
                )}
                <FaExternalLinkAlt
                  size={12}
                  className="text-zinc-600 group-hover:text-zinc-300"
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
