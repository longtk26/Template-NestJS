import { Request } from 'express';

export interface UserPayloadJWT {
  userId: string;
}

export interface UserRequest extends Request {
  user: UserPayloadJWT;
}
