import * as vscode from 'vscode';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import { projectsCache, ProjectTreeItem } from '../treeView/ProjectTreeItem';
import type { IAction } from './IAction';

export class RefreshProjectTreeAction implements IAction {
  constructor(private readonly item: ProjectTreeItem) {}

  public async run() {
    const cacheId = ProjectTreeItem.getCacheId(
      this.item.workspaceRoot,
      this.item.label,
    );
    projectsCache.clear(cacheId);
    await vscode.commands.executeCommand(
      CommandProvider.getCommandName(RefreshTreeCommand.commandName),
      false,
    );
  }
}
