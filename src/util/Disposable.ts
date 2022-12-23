import type * as vscode from 'vscode';

interface IDisposable {
  dispose(): void;
}

export class Disposable implements IDisposable {
  protected subscriptions: vscode.Disposable[] = [];

  public dispose(): void {
    this.subscriptions.forEach(subscription => subscription.dispose());
  }
}
