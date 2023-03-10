import * as vscode from 'vscode';
import { TERMINAL_NAME } from '../constants/constants';
import { Disposable } from '../util/Disposable';
import type { Terminal } from './Terminal';

export class TerminalProvider extends Disposable {
  constructor(private readonly terminal: Terminal) {
    super();
  }

  public async provideTerminal(): Promise<Terminal> {
    let existingTerminal = vscode.window.terminals.find(
      ({ name }) => name === TERMINAL_NAME,
    );
    if (!existingTerminal) {
      existingTerminal = vscode.window.createTerminal({
        name: TERMINAL_NAME,
        pty: this.terminal,
      });
      this.subscriptions.push(existingTerminal);
    }
    existingTerminal.show();
    await vscode.commands.executeCommand(
      'workbench.action.terminal.scrollToBottom',
    );
    return this.terminal;
  }
}
