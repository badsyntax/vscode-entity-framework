import { GenerateScriptAction } from '../actions/GenerateScriptAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

export class GenerateScriptCommand extends Command {
  public static commandName = 'generateScript';

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
    return new GenerateScriptAction(
      this.terminalProvider,
      this.item.workspaceRoot,
      this.item.label,
      this.item.project,
    ).run();
  }
}
