import "dotenv/config";

type Env = "MNEMONIC"|"HOST"|"PORT"|"DATABASE_URL"|"SECRET_KEY"|"SERVICE_ACCOUNT";

export const getEnv = <T extends object | number | string = string>(
  name: Env,
  refine?: <K extends unknown>(value: K) => T
) => {
  const value = process.env["APP_" + name] || process.env[name] ;
  if (value)
    try {
      const parsed = JSON.parse(value) as T;
      return refine ? (refine(parsed) as T) : parsed;
    } catch {
      return (refine ? refine(value) : value) as T;
    }
  return null;
};
