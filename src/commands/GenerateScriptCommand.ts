import { GenerateScriptAction } from '../actions/GenerateScriptAction';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

export class GenerateScriptCommand extends Command {
  public static commandName = 'generateScript';

  constructor(private readonly item: DbContextTreeItem) {
    super();
  }

  public async run() {
    return new GenerateScriptAction(
      this.item.solutionFile.workspaceRoot,
      this.item.label,
      this.item.project,
    ).run();
  }
}
