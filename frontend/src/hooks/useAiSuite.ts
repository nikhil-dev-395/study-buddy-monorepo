import { useCallback, useState } from "react";
import { env } from "../utils/env";
import { fetchWithAuth } from "../utils/fetchAuth";

const BASE_URL = env.VITE_API_BASE_URL;

export interface RoadmapPhase {
  phase: string;
  topics: string[];
  project: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface NotesSummary {
  overview: string;
  keyPoints: string[];
  actionItems: string[];
}

export interface TutorMessage {
  sender: "user" | "ai";
  text: string;
}

async function postAi<T>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithAuth(`${BASE_URL}/ai/${path}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "AI request failed.");
  return json.data as T;
}

export function useAiSuite() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      return await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI request failed.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateRoadmap = useCallback(
    (goal: string, days: number) =>
      run(() => postAi<{ phases: RoadmapPhase[] }>("roadmap", { goal, days })),
    [run],
  );

  const generateQuiz = useCallback(
    (topic: string, count = 5) =>
      run(() => postAi<{ questions: QuizQuestion[] }>("quiz", { topic, count })),
    [run],
  );

  const summarizeNotes = useCallback(
    (notes: string) => run(() => postAi<NotesSummary>("summarize", { notes })),
    [run],
  );

  const askTutor = useCallback(
    (message: string, history: TutorMessage[]) =>
      run(() => postAi<{ reply: string }>("tutor", { message, history })),
    [run],
  );

  return { loading, error, generateRoadmap, generateQuiz, summarizeNotes, askTutor };
}
