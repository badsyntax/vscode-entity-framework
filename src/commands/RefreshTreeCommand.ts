import { RefreshTreeAction } from '../actions/RefreshTreeAction';
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
    await new RefreshTreeAction(this.treeDataProvider, this.clearCache).run();
  }
}
