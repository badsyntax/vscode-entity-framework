import { RefreshDbContextTreeAction } from '../actions/RefreshDbContextTreeAction';
import type { DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';

export class RefreshDbContextTreeCommand extends Command {
  public static commandName = 'refreshDbContextTree';

  constructor(private readonly item?: DbContextTreeItem) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    await new RefreshDbContextTreeAction(this.item).run();
  }
}
