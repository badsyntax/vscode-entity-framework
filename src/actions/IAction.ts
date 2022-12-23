export interface IAction {
  run(): Promise<void>;
}
