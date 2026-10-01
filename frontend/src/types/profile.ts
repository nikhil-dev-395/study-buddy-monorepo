export interface AcademicDetails {
  institution: string;
  major: string;
  year: string;
}

export interface FullUserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  location: string;
  bio: string;
  userType: string;
  academicDetails: AcademicDetails;
  status: { isSearching: boolean; lastActive: string };
  studyPreferences: {
    mode: "online" | "in-person" | "hybrid";
    timeZone: string;
    availability: string[];
    learningStyle: string;
  };
  skills: { learning: string[]; teaching: string[] };
  workExperience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  proofOfWork: {
    github?: { username: string; topRepo?: string; stars?: number; url: string } | null;
    medium?: { username: string; url: string } | null;
    dribbble?: { username: string; url: string } | null;
    devTo?: { username: string; url: string } | null;
    kaggle?: { username: string; tier?: string; url: string } | null;
    personalWebsite?: string | null;
  };
  featuredPosts: Array<{
    id: string;
    platform: string;
    title: string;
    url: string;
    stars?: number | null;
    claps?: number | null;
    likes?: number | null;
    date: string;
  }>;
  socials: { github?: string | null; linkedin?: string | null; discord?: string | null };
}

/** Raw DB-shaped profile — what GET /profile/{id} and POST /profile/onboard use. */
export interface RawProfile {
  name: string;
  headline?: string | null;
  location?: string | null;
  study_mode?: string | null;
  about?: string | null;
  trust_score?: string | null;
  discord_handle?: string | null;
  linkedin_url?: string | null;
  proof_of_work: Record<string, unknown>;
  featured_posts: Array<Record<string, unknown>>;
  study_specs: Record<string, unknown>;
  work_history: Array<Record<string, unknown>>;
}
