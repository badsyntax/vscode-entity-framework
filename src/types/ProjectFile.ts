import type { Project } from 'vs-parse';

export type ProjectFile = {
  name: string;
  project: Project;
  workspaceRoot: string;
  path: string;
};
