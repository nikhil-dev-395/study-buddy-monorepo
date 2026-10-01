export interface AcademicDetails {
  institution?: string | null;
  major?: string | null;
  year?: string | null;
}

export interface StudyPreferences {
  subjects: string[];
  mode: "online" | "in-person" | "hybrid";
}

export interface BuddyCard {
  id: number;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  academicDetails: AcademicDetails;
  studyPreferences: StudyPreferences;
  status: { isSearching: boolean };
  isRequestAccepted: boolean;
  connectionRequestId: number;
}

export interface ConnectionRequestRecord {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: "pending" | "accepted" | "rejected" | "cancelled";
  message?: string | null;
  created_at: string;
  updated_at: string;
}
