import * as vscode from 'vscode';
import path from 'node:path';
import { DB_CONTEXT_MODEL_SNAPSHOT_SUFFIX } from '../constants/constants';
import type { SolutionFile } from '../types/SolutionFile';
import { FileSystemWatcher } from './FileSystemWatcher';
import {
  dbContextsCache,
  DbContextTreeItem,
} from '../treeView/DbContextTreeItem';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';

export class DbContextModelSnapshotWatcher extends FileSystemWatcher {
  public constructor(private readonly solutionFiles: SolutionFile[]) {
    super(`**/*${DB_CONTEXT_MODEL_SNAPSHOT_SUFFIX}`);
    this.onDidChange(this.handleDbContextFileChange.bind(this));
  }

  private async handleDbContextFileChange(uri: vscode.Uri) {
    if (uri && uri.path.endsWith(DB_CONTEXT_MODEL_SNAPSHOT_SUFFIX)) {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
      if (workspaceFolder) {
        this.clearDbContextCache(uri.path, workspaceFolder);
      }
    }

    await vscode.commands.executeCommand(
      CommandProvider.getCommandName(RefreshTreeCommand.commandName),
      false,
    );
  }

  private clearDbContextCache(
    filePath: string,
    workspaceFolder: vscode.WorkspaceFolder,
  ) {
    const dbContextName = path
      .basename(filePath)
      .replace(DB_CONTEXT_MODEL_SNAPSHOT_SUFFIX, '');
    const solutionFile = this.solutionFiles.find(
      solutionFile =>
        path.basename(solutionFile.workspaceRoot) === workspaceFolder?.name,
    );
    if (solutionFile) {
      const project = solutionFile.solution.projects.find(slnProject =>
        filePath.startsWith(
          path.dirname(
            path.join(solutionFile.workspaceRoot, slnProject.relativePath),
          ),
        ),
      );
      if (project) {
        const cacheId = DbContextTreeItem.getCacheId(
          solutionFile.workspaceRoot,
          project.name,
          dbContextName,
        );
        dbContextsCache.clear(cacheId);
      }
    }
  }
}
