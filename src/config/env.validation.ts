import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export const envSchema = z.object({
  PORT: z.string().optional().default('3000'),
  ENV: z.string().optional().default('dev'),
  SECRET_KEY: z.string(),
  POSTGRES_URI: z.string(),
  REDIS_URI: z.string(),
  BROKER_HOST: z.string(),
  BROKER_PORT: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  EMAIL_HOST: z.string(),
  EMAIL_PORT: z.string(),
  EMAIL_SECURE: z.string(),
  EMAIL_SERVICE: z.string(),
  TIME_NOTIFY_REMINDER: z.string().optional().default('300000'), // 5 minutes in ms
  CLIENT_URL: z.string(),
  JWT_ACCESS_TOKEN_EXPIRES: z.string(),
  JWT_REFRESH_TOKEN_EXPIRES: z.string(),
  SALT_ROUNDS: z.string(),
  AWS_REGION: z.string().optional().default('ap-southeast-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string(),
});

export type EnvSchema = z.infer<typeof envSchema>;

/**
 * Check for unexpected environment variables not defined in the schema
 * @returns Array of unexpected variables found in .env files
 */
export function checkUnexpectedEnvVars(
  rootDir: string = process.cwd(),
): string[] {
  const envFiles = ['.env'];
  const unexpectedVars: string[] = [];
  const schemaKeys = Object.keys(envSchema.shape);

  for (const envFile of envFiles) {
    const envFilePath = path.join(rootDir, envFile);

    if (fs.existsSync(envFilePath)) {
      const envFileContent = fs.readFileSync(envFilePath, 'utf8');
      const parsedEnv = dotenv.parse(envFileContent);

      for (const key of Object.keys(parsedEnv)) {
        if (!schemaKeys.includes(key)) {
          unexpectedVars.push(`${key} in ${envFile}`);
        }
      }
    }
  }

  return unexpectedVars;
}

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, any> {
  // Check for unexpected/unrelated variables in .env files
  const unexpectedVarsInEnvFiles = checkUnexpectedEnvVars();

  if (unexpectedVarsInEnvFiles.length > 0) {
    console.error(
      '❌ Error: The following unexpected variables were found in .env files:',
      unexpectedVarsInEnvFiles.join(', '),
    );

    throw new Error(
      'Unexpected environment variables found in .env files. See logs for details.',
    );
  }

  const result = envSchema.safeParse(config);

  if (!result.success) {
    console.error(
      '❌ Environment validation errors:',
      JSON.stringify(result.error.format(), null, 2),
    );
    throw new Error(
      '⚠️ Invalid environment variables. Check server logs for more details.',
    );
  }

  return result.data;
}
