export const getEnv = (name: string) => {
  const env = process.env[name]

  if (env === undefined) throw Error(`Missing environment variable: ${name}`)

  return env
}
