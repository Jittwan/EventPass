import { z } from "zod";

export const registrationSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name is required").max(120),
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    phone: z.string().trim().min(5, "Phone is required").max(40),
    organization: z.string().trim().min(1, "Organization is required").max(200),
    position: z.string().trim().min(1, "Position is required").max(200),
    dietaryRequirement: z.string().trim().max(200).default(""),
    password: z.string().min(8, "Password must be at least 8 characters").max(200),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const updateRegistrationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(5).max(40),
  organization: z.string().trim().min(1).max(200),
  position: z.string().trim().min(1).max(200),
  dietaryRequirement: z.string().trim().max(200).default(""),
});

export type UpdateRegistrationInput = z.infer<typeof updateRegistrationSchema>;

export const lookupSchema = z.object({
  referenceCode: z.string().trim().min(1, "Reference code is required"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function flattenZodError(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
