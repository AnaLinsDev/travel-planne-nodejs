import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  FRONT_BASE_URL: z.url(),
  API_BASE_URL: z.url(),
  PORT: z.coerce.number().default(3000),
});

export const env = envSchema.parse(process.env)

