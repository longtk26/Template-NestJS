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
