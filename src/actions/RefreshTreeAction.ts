import type { TreeDataProvider } from '../treeView/TreeDataProvider';
import type { IAction } from './IAction';

export class RefreshTreeAction implements IAction {
  constructor(private readonly treeDataProvider: TreeDataProvider) {}

  public async run() {
    this.treeDataProvider.refresh();
  }
}
