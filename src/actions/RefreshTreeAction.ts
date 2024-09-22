import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import type { IAction } from './IAction';

export class RefreshTreeAction implements IAction {
  constructor(
    private readonly treeDataProvider: TreeDataProvider,
    private readonly clearCache: boolean,
  ) {}

  public async run() {
    this.treeDataProvider.refresh(this.clearCache);
  }
}
