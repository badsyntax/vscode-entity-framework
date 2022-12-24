import { DBContextInfoCommandAction } from '../actions/DBContextInfoCommandAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

export class DBContextInfoCommand extends Command {
  public static commandName = 'dbContextInfo';

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
    return new DBContextInfoCommandAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.label,
      this.item.project,
    ).run();
  }
}
