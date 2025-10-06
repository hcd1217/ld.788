import z from 'zod/v4';

import type { Dictionary } from '@/types/dictionary';
// import { isDevelopment } from '@/utils/env';

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!#$%&()*?@^])[\d!#$%&()*?@A-Z^a-z]{8,}$/;

const jwtTokenRegex = /^(?:[\w-]{10,}\.){2}[\w-]{10,}$/;

export const passwordSchema = z.string().regex(passwordRegex);
export const jwtTokenSchema = z.string().regex(jwtTokenRegex);
export const clientCodeSchema = z
  .string()
  .min(3)
  .max(10)
  .regex(/^[\dA-Z]+$/);
export const booleanSchema = z.boolean();
export const optionalBooleanSchema = z.boolean().optional();
export const falseBooleanSchema = z
  .boolean()
  .optional()
  .transform(() => false);
export const trueBooleanSchema = z
  .boolean()
  .optional()
  .transform(() => true);
export const numberSchema = z.number();
export const optionalNumberSchema = z.number().optional();
export const stringSchema = z.string();
export const idSchema = z.uuid();
export const optionalIdSchema = idSchema.optional();
export const emailSchema = z.email();
export const timestampSchema = z.union([z.number(), z.string()]).transform((val) => new Date(val));
export const optionalTimestampSchema = timestampSchema.optional();
export const backEndTimestampSchema = z
  .union([z.number(), z.string()])
  .transform((val) => new Date(val).toISOString());
export const optionalBackEndTimestampSchema = backEndTimestampSchema.optional();
export const optionalStringSchema = z.string().optional();
export const dictionarySchema: z.ZodType<Dictionary> = z.lazy(() =>
  z.record(z.string(), z.union([z.string(), dictionarySchema])),
);
export const phoneNumberSchema = optionalStringSchema
  .transform((val) => {
    if (!val) {
      return undefined;
    }
    // remove non-numeric and convert 09012345678 / 090123456789 to 0901-234-5678 / 0901-234-56789
    return val?.replace(/\D/g, '').replace(/(\d{4})(\d{3})(\d+)/, '$1-$2-$3');
  })
  .optional();
export const backendPhoneNumberSchema = optionalStringSchema
  .transform((val) => {
    if (!val) {
      return undefined;
    }
    return val?.replace(/\D/g, '');
  })
  .optional();

export const paginationSchema = z.object({
  limit: z.number(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
  nextCursor: optionalStringSchema,
  prevCursor: optionalStringSchema,
});

export const ClientPublicConfigSchema = z.object({
  features: z.object({
    language: z.boolean(),
    darkMode: z.boolean(),
  }),
  clientCode: optionalStringSchema,
  clientName: optionalStringSchema,
  logoUrl: optionalStringSchema,
});

// Address schema
export const AddressSchema = z.object({
  oneLineAddress: optionalStringSchema,
  googleMapsUrl: optionalStringSchema,
});

// const dummyUrl =
//   'https://t3.ftcdn.net/jpg/02/17/65/88/360_F_217658823_vVaB79Y6lBL2JRk9eFPBKR6PdwcL8Ett.jpg';

export const S3DataSchema = z.looseObject({
  id: idSchema,
  // publicUrl: isDevelopment ? stringSchema.transform(() => dummyUrl) : stringSchema,
  publicUrl: stringSchema,
  key: stringSchema,
  caption: optionalStringSchema,
  timestamp: stringSchema,
  uploadedBy: idSchema, // User ID
});

export const UploadPhotoSchema = S3DataSchema.omit({
  id: true,
  timestamp: true,
  uploadedBy: true,
});
