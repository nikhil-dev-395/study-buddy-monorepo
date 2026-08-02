import { z } from "zod";

export const envVariables = z.object({
  VITE_BASE_URL: z.string().url().startsWith("http://", "https://"),
  VITE_API_BASE_URL: z.string().url().startsWith("http://", "https://"),
  VITE_NODE_ENV: z.string().refine((val) => ["development", "production"].includes(val), {
    message: "VITE_NODE_ENV must be either 'development' or 'production'",
  }),
  VITE_GOOGLE_CLIENT_ID: z.string(),
  VITE_GOOGLE_CLIENT_SECRET: z.string(),
});

export type TEnvVariables = z.infer<typeof envVariables>;

export const env = envVariables.parse(import.meta.env);
