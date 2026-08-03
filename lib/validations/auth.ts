import { z } from "zod";
import { emailSchema } from "@/lib/validations/common";

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;
