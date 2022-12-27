import { ScaffoldAction } from '../actions/ScaffoldAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

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
    return new ScaffoldAction(
      this.terminalProvider,
      this.item.projectFile,
    ).run();
  }
}
