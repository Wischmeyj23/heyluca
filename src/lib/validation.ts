import { z } from "zod";

/**
 * Contact validation schema
 * Ensures all contact data is properly validated before storage
 */
export const contactSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  company: z
    .string()
    .trim()
    .max(100, "Company name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20, "Phone number must be less than 20 characters")
    .regex(/^[0-9\s\-\+\(\)]*$/, "Phone number contains invalid characters")
    .optional()
    .or(z.literal("")),
  linkedin_url: z
    .string()
    .trim()
    .url("Invalid URL format")
    .refine(
      (url) => !url || url.includes("linkedin.com"),
      "Must be a valid LinkedIn URL"
    )
    .optional()
    .or(z.literal("")),
  avatar_url: z
    .string()
    .trim()
    .url("Invalid avatar URL")
    .optional()
    .or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
