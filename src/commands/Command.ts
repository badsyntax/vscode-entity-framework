export abstract class Command {
  public static commandName: string;
  public run(): Promise<void> {
    throw new Error('Not implemented');
  }
}
