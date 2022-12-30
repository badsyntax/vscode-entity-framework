import * as vscode from 'vscode';
import path from 'path';
import type { ProjectFile } from '../types/ProjectFile';
import type { DependencyTree, Project } from 'nuget-deps-tree';
import { NugetDepsTree } from 'nuget-deps-tree';

export type ProjectFiles = {
  projectFiles: ProjectFile[];
  solutionProjects: Project[] | undefined;
};

export class ProjectFilesProvider {
  public static async getProjectFiles(): Promise<ProjectFiles> {
    const workspaceRoots = vscode.workspace.workspaceFolders || [];

    const projectFiles: ProjectFile[] = [];
    const solutionProjects: Project[] = [];

    for (const workspaceRoot of workspaceRoots) {
      const solutionFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(workspaceRoot, '**/*.sln'),
      );
      for (const solutionFile of solutionFiles) {
        const tree = NugetDepsTree.generate(solutionFile.fsPath);
        solutionProjects.push(...tree.projects);
      }
      const csProjFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(workspaceRoot, '**/*.csproj'),
      );
      for (const projectFile of csProjFiles) {
        const { projects } = NugetDepsTree.generate(projectFile.fsPath);
        const [project] = projects;
        const hasEFDesignPackage =
          ProjectFilesProvider.getProjectPackage(
            [project],
            id => id === 'Microsoft.EntityFrameworkCore.Design',
          ) !== undefined;
        if (hasEFDesignPackage) {
          const projectName = path.basename(path.dirname(projectFile.fsPath));

          projectFiles.push({
            name: projectName,
            project,
            workspaceRoot: workspaceRoot.uri.fsPath,
            path: projectFile.fsPath,
          });
        }
      }
    }

    return {
      projectFiles,
      solutionProjects:
        solutionProjects.length > 0 ? solutionProjects : undefined,
    };
  }

  public static getProjectPackage(
    projects: Project[],
    match: (id: string) => boolean,
    transitive = false,
  ): DependencyTree | undefined {
    for (const project of projects) {
      const matched = this.getPackageInTree(
        project.dependencies,
        match,
        transitive,
      );
      if (matched) {
        return matched;
      }
    }
  }

  private static getPackageInTree(
    depTree: DependencyTree[],
    match: (id: string) => boolean,
    transitive = false,
  ): DependencyTree | undefined {
    for (const dep of depTree) {
      if (match(dep.id)) {
        return dep;
      }
      if (transitive) {
        const matchedTransitive = this.getPackageInTree(
          dep.dependencies,
          match,
          transitive,
        );
        if (matchedTransitive) {
          return matchedTransitive;
        }
      }
    }
  }
}
