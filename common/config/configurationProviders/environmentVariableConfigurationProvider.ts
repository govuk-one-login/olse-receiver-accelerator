import { AbstractConfigurationProvider } from "./abstractConfigurationProvider";

export class EnvironmentVariableConfigurationProvider extends AbstractConfigurationProvider {
  public override async getAll(): Promise<Map<string, string>> {
    return new Map();
  }

  public override get(key: string): string {
    const value = process.env[key];
    if (typeof value === "string") {
      return value;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }

  public override async initialise(): Promise<void> {}
}
