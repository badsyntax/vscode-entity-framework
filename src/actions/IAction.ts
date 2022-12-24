export interface IAction {
  run(): Promise<string | void>;
}
