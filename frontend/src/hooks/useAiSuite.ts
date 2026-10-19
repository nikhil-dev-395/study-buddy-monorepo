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

export interface Flashcard {
  front: string;
  back: string;
}

export interface NotesSummary {
  overview: string;
  keyPoints: string[];
  actionItems: string[];
  flashcards?: Flashcard[];
}

export type QuizDifficulty = "easy" | "medium" | "hard";
type AiTool = "roadmap" | "quiz" | "summarize" | "tutor";

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

/** Each tool tracks its own loading/error so one tab's request doesn't block another. */
export function useAiSuite() {
  const [loading, setLoading] = useState<Partial<Record<AiTool, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<AiTool, string | null>>>({});

  const run = useCallback(
    async <T,>(tool: AiTool, fn: () => Promise<T>): Promise<T | null> => {
      try {
        setLoading((l) => ({ ...l, [tool]: true }));
        setErrors((e) => ({ ...e, [tool]: null }));
        return await fn();
      } catch (err) {
        setErrors((e) => ({
          ...e,
          [tool]: err instanceof Error ? err.message : "AI request failed.",
        }));
        return null;
      } finally {
        setLoading((l) => ({ ...l, [tool]: false }));
      }
    },
    [],
  );

  const generateRoadmap = useCallback(
    (goal: string, days: number) =>
      run("roadmap", () => postAi<{ phases: RoadmapPhase[] }>("roadmap", { goal, days })),
    [run],
  );

  const generateQuiz = useCallback(
    (topic: string, count = 5, difficulty: QuizDifficulty = "medium") =>
      run("quiz", () =>
        postAi<{ questions: QuizQuestion[] }>("quiz", { topic, count, difficulty }),
      ),
    [run],
  );

  const summarizeNotes = useCallback(
    (notes: string) => run("summarize", () => postAi<NotesSummary>("summarize", { notes })),
    [run],
  );

  const askTutor = useCallback(
    (message: string, history: TutorMessage[]) =>
      run("tutor", () => postAi<{ reply: string }>("tutor", { message, history })),
    [run],
  );

  return { loading, errors, generateRoadmap, generateQuiz, summarizeNotes, askTutor };
}
