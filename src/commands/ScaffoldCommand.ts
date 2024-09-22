import * as vscode from 'vscode';
import { ScaffoldAction } from '../actions/ScaffoldAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';
import { ProjectFilesProvider } from '../solution/ProjectFilesProvider';
import { ProjectTreeItem, projectsCache } from '../treeView/ProjectTreeItem';
import { CommandProvider } from './CommandProvider';
import { RefreshTreeCommand } from './RefreshTreeCommand';

export class ScaffoldCommand extends Command {
  public static commandName = 'scaffold';

  constructor(
    private readonly terminalProvider: TerminalProvider,
    private readonly item?: DbContextTreeItem,
  ) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    const { solutionProjects } = await ProjectFilesProvider.getProjectFiles();
    await new ScaffoldAction(
      this.terminalProvider,
      this.item.projectFile,
      solutionProjects,
    ).run();
    const cacheId = ProjectTreeItem.getCacheId(
      this.item.projectFile.workspaceRoot,
      this.item.projectFile.name,
    );
    projectsCache.clear(cacheId);
    await vscode.commands.executeCommand(
      CommandProvider.getCommandName(RefreshTreeCommand.commandName),
      false,
    );
  }
}
