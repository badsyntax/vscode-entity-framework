import * as vscode from 'vscode';
import path from 'node:path';
import { parseProject } from 'vs-parse';
import type { ProjectFile } from '../types/ProjectFile';

export class ProjectFilesProvider {
  public static async getProjectFiles() {
    const workspaceRoots = vscode.workspace.workspaceFolders || [];

    const projects: ProjectFile[] = [];

    for (const workspaceRoot of workspaceRoots) {
      const projectFiles = await vscode.workspace.findFiles(
        new vscode.RelativePattern(workspaceRoot, '**/*.csproj'),
      );
      for (const projectFile of projectFiles) {
        const project = await parseProject(projectFile.fsPath);
        const hasEFDesignPackage =
          (project.packages || []).find(
            pkg => pkg.name === 'Microsoft.EntityFrameworkCore.Design',
          ) !== undefined;
        if (hasEFDesignPackage) {
          const projectName = path.basename(path.dirname(projectFile.fsPath));
          projects.push({
            name: projectName,
            project,
            workspaceRoot: workspaceRoot.uri.fsPath,
            path: projectFile.fsPath,
          });
        }
      }
    }

    return projects;
  }
}
