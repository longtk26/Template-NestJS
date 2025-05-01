import { EAcceptMimeFile } from '../constants/file.constant';

export type TAcceptFile = keyof typeof EAcceptMimeFile;
export type TOptionValidateFile = {
  maxSize?: number;
};
