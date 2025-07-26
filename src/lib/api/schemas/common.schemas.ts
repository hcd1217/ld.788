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
export const booleanSchema = z.boolean();
export const numberSchema = z.number();
export const stringSchema = z.string();
export const idSchema = z.string();
export const emailSchema = z.email();
export const timestampSchema = z
  .union([z.number(), z.string()])
  .transform((val) => new Date(val).toISOString());
export const optionalStringSchema = z.string().optional();
export const paginationSchema = z.object({
  limit: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
  nextCursor: optionalStringSchema,
  prevCursor: optionalStringSchema,
});

export const ClientPublicConfigSchema = z.object({
  clientCode: stringSchema,
  clientName: optionalStringSchema,
  logoUrl: optionalStringSchema,
  translations: z
    .record(z.string(), z.record(z.string(), z.string()))
    .optional(),
});
