export type CreateUserRepository = {
  name: string;
  email: string;
  password: string;
};

export type UpdateUserRepository = {
  name?: string;
  isVerified?: boolean;
}