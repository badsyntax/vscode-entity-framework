import { clearTreeCache } from '../treeView/treeCache';
import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import type { IAction } from './IAction';

export class RefreshTreeAction implements IAction {
  constructor(
    private readonly treeDataProvider: TreeDataProvider,
    private readonly clearCache = true,
  ) {}

  public async run() {
    if (this.clearCache) {
      clearTreeCache();
    }
    this.treeDataProvider.refresh();
  }
}
