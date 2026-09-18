export const getEnv = (name: string): string => {
  const env = process.env[name];

  if (env === undefined) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return env;
};
