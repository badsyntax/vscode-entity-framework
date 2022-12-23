import * as vscode from 'vscode';
import { Disposable } from '../util/Disposable';
import type { Terminal } from './Terminal';

const TERMINAL_NAME = 'ef-migrations';

export class TerminalProvider extends Disposable {
  constructor(private readonly terminal: Terminal) {
    super();
  }

  public provideTerminal(): Terminal {
    let existingTerminal = vscode.window.terminals.find(
      t => t.name === TERMINAL_NAME,
    );
    if (!existingTerminal) {
      existingTerminal = vscode.window.createTerminal({
        name: TERMINAL_NAME,
        pty: this.terminal,
      });
      this.subscriptions.push(existingTerminal);
    }
    existingTerminal.show();
    return this.terminal;
  }
}
