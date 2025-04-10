export type JwtAppPayload = {
  sub: string;
  username: string;
  email: string;
  iat: number;
  exp: number;
};
