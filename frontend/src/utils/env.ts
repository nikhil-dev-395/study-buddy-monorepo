import { z } from "zod";

export const envVariables = z.object({
  VITE_BASE_URL: z.string().url().startsWith("http://", "https://"),
  VITE_API_BASE_URL: z.string().url().startsWith("http://", "https://"),
});

export type TEnvVariables = z.infer<typeof envVariables>;

export const env = envVariables.parse(import.meta.env);
