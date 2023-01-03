import { RefreshProjectTreeAction } from '../actions/RefreshProjectTreeAction';
import type { ProjectTreeItem } from '../treeView/ProjectTreeItem';
import { Command } from './Command';

export class RefreshProjectTreeCommand extends Command {
  public static commandName = 'refreshProjectTree';

  constructor(private readonly item?: ProjectTreeItem) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    await new RefreshProjectTreeAction(this.item).run();
  }
}
