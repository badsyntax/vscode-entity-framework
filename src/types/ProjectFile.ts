import type { Project } from 'nuget-deps-tree';

export type ProjectFile = {
  name: string;
  project: Project;
  workspaceRoot: string;
  path: string;
};
