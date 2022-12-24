import * as vscode from 'vscode';
// import type { SolutionFile } from '../types/SolutionFile';

export abstract class TreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly workspaceRoot: string,
    collapsibleState?: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }

  public getChildren(): Promise<TreeItem[]> {
    throw new Error('Not implemented');
  }
}
