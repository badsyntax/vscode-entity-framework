import * as vscode from 'vscode';
import { parseSolution } from 'vs-parse';
import path from 'node:path';
import type { SolutionFile } from '../types/SolutionFile';

export class SolutionFinder {
  public static async getSolutionFiles() {
    const workspaceRoots =
      vscode.workspace.workspaceFolders?.map(w => w.uri.fsPath) || [];

    const solutionFiles: SolutionFile[] = [];

    for (const workspaceRoot of workspaceRoots) {
      const [solutionFile] = await vscode.workspace.findFiles(
        new vscode.RelativePattern(workspaceRoot, '*.sln'),
        undefined,
        1,
      );
      const solution = await parseSolution(solutionFile.path, {
        deepParse: true,
      });
      solutionFiles.push({
        name: path.parse(solutionFile.path).name,
        solution,
        workspaceRoot,
      });
    }

    return solutionFiles;
  }
}
