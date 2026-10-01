import { useState } from "react";
import { FiX } from "react-icons/fi";
import type { RawProfile } from "../../types/profile";

type EditProfileModalProps = {
  initialRaw: RawProfile | null;
  fallbackName: string;
  onClose: () => void;
  onSave: (payload: RawProfile) => Promise<void>;
};

const STUDY_MODES = ["Hybrid Mode", "Online Mode", "In-Person Mode"];

function splitHeadline(headline?: string | null) {
  const parts = (headline || "").split("•").map((p) => p.trim());
  return {
    major: parts[0] || "",
    year: parts[1] || "",
    institution: parts[2] || "",
  };
}

function csv(list?: unknown): string {
  return Array.isArray(list) ? list.join(", ") : "";
}

function fromCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function EditProfileModal({
  initialRaw,
  fallbackName,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const headlineParts = splitHeadline(initialRaw?.headline);
  const specs = (initialRaw?.study_specs || {}) as Record<string, unknown>;
  const pow = (initialRaw?.proof_of_work || {}) as Record<string, unknown>;
  const github = (pow.github || {}) as Record<string, unknown>;

  const [name, setName] = useState(initialRaw?.name || fallbackName);
  const [major, setMajor] = useState(headlineParts.major);
  const [year, setYear] = useState(headlineParts.year);
  const [institution, setInstitution] = useState(headlineParts.institution);
  const [location, setLocation] = useState(initialRaw?.location || "");
  const [about, setAbout] = useState(initialRaw?.about || "");
  const [studyMode, setStudyMode] = useState(initialRaw?.study_mode || STUDY_MODES[0]);
  const [discord, setDiscord] = useState(initialRaw?.discord_handle || "");
  const [linkedin, setLinkedin] = useState(initialRaw?.linkedin_url || "");
  const [githubUsername, setGithubUsername] = useState((github.username as string) || "");
  const [githubUrl, setGithubUrl] = useState((github.url as string) || "");
  const [teaching, setTeaching] = useState(csv(specs.can_teach));
  const [learning, setLearning] = useState(csv(specs.wants_to_learn));
  const [availability, setAvailability] = useState(csv(specs.availability));
  const [learningApproach, setLearningApproach] = useState(
    (specs.learning_approach as string) || "",
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      const payload: RawProfile = {
        name: name.trim(),
        headline: [major, year, institution].filter(Boolean).join(" • "),
        location: location.trim(),
        study_mode: studyMode,
        about: about.trim(),
        trust_score: initialRaw?.trust_score || "Verified Learner",
        discord_handle: discord.trim(),
        linkedin_url: linkedin.trim(),
        proof_of_work: {
          ...pow,
          ...(githubUsername.trim() || githubUrl.trim()
            ? { github: { ...github, username: githubUsername.trim(), url: githubUrl.trim() } }
            : { github: undefined }),
        },
        featured_posts: initialRaw?.featured_posts || [],
        study_specs: {
          ...specs,
          can_teach: fromCsv(teaching),
          wants_to_learn: fromCsv(learning),
          availability: fromCsv(availability),
          learning_approach: learningApproach.trim(),
          timezone: (specs.timezone as string) || "IST (UTC+5:30)",
        },
        work_history: initialRaw?.work_history || [],
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-900">
          <h3 className="text-zinc-100 font-semibold text-base">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Major</label>
              <input
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="Computer Science"
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Year</label>
              <input
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="Junior"
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Institution
              </label>
              <input
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="IIT Bombay"
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Mumbai, Maharashtra"
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">Study Mode</label>
              <select
                value={studyMode}
                onChange={(e) => setStudyMode(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              >
                {STUDY_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">About</label>
            <textarea
              rows={3}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              className="w-full bg-black/60 border border-zinc-800 rounded-xl p-3 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                Discord Handle
              </label>
              <input
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="username#1234"
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                LinkedIn URL
              </label>
              <input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">
                GitHub Username
              </label>
              <input
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400 block mb-1">GitHub URL</label>
              <input
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Can Teach (comma-separated)
            </label>
            <input
              value={teaching}
              onChange={(e) => setTeaching(e.target.value)}
              placeholder="Python, React, FastAPI"
              className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Wants to Learn (comma-separated)
            </label>
            <input
              value={learning}
              onChange={(e) => setLearning(e.target.value)}
              placeholder="System Design, Kubernetes"
              className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Availability (comma-separated)
            </label>
            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Mon/Wed/Fri - 6 PM to 9 PM, Weekends - Full Day"
              className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 block mb-1">
              Learning Approach
            </label>
            <input
              value={learningApproach}
              onChange={(e) => setLearningApproach(e.target.value)}
              placeholder="Project building & mock DSA rounds"
              className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3.5 py-2 text-zinc-100 text-xs focus:border-zinc-600 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="pt-3 flex justify-end gap-2 border-t border-zinc-800 sticky bottom-0 bg-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-black font-semibold text-xs rounded-xl transition active:scale-95"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
