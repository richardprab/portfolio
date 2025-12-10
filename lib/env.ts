function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

export const env = {
  MONGODB_URI: getEnvVar('MONGODB_URI'),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
} as const;

