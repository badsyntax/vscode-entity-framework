export abstract class Command {
  public static commandName: string;
  public run(): Promise<void | string> {
    throw new Error('Not implemented');
  }
}
