import { z } from 'zod';

export const createManyUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const createManyUserSchemaArray = z.array(createManyUserSchema);

export type CreateManyUserArrayType = z.infer<typeof createManyUserSchemaArray>;

export type CreateManyUserType = z.infer<typeof createManyUserSchema>;

export type CreateUserRepository = {
  firstName: string;
  email: string;
  password: string;
};

export type UpdateUserRepository = {
  name?: string;
  isVerified?: boolean;
  password?: string;
};
