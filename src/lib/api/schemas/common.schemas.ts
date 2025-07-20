import z from 'zod/v4';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&()^])[A-Za-z\d@#$!%*?&()^]{8,}$/;

const jwtTokenRegex = /^(?:[\w-]{10,}\.){2}[\w-]{10,}$/;

export const passwordSchema = z.string().regex(passwordRegex);
export const jwtTokenSchema = z.string().regex(jwtTokenRegex);
export const clientCodeSchema = z
  .string()
  .min(3)
  .max(10)
  .regex(/^[A-Z\d]+$/);
export const idSchema = z.string();
export const emailSchema = z.email();
export const timestampSchema = z
  .union([z.number(), z.string()])
  .transform((val) => new Date(val).toISOString());
export const optionalStringSchema = z.string().optional();
