import type { Solution } from 'vs-parse';

export type SolutionFile = {
  name: string;
  solution: Solution;
  workspaceRoot: string;
};
