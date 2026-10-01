import { z } from "zod";

export const envVariables = z.object({
  VITE_BASE_URL: z.string().url().startsWith("http://", "https://"),
  VITE_API_BASE_URL: z.string().url().startsWith("http://", "https://"),
  VITE_NODE_ENV: z.string(),
  VITE_GOOGLE_CLIENT_ID: z.string(),
  VITE_GOOGLE_CLIENT_SECRET: z.string(),
  // Optional: once set, chat upgrades from polling to live Supabase Realtime.
  VITE_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  VITE_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
});

export type TEnvVariables = z.infer<typeof envVariables>;

export const env = envVariables.parse(import.meta.env);
