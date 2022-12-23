import { clearTreeCache } from '../treeView/treeCache';
import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import { Command } from './Command';

export class RefreshTreeCommand extends Command {
  public static commandName = 'refreshTree';

  constructor(
    private readonly treeDataProvider: TreeDataProvider,
    private readonly clearCache = true,
  ) {
    super();
  }

  public async run() {
    if (this.clearCache) {
      clearTreeCache();
    }
    this.treeDataProvider.refresh();
  }
}
