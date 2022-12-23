import * as vscode from 'vscode';
import { getEnvConfig } from '../config/config';

export class Terminal {
  private static terminal: vscode.Terminal | undefined;

  public static run(args: string[], path: string) {
    if (!this.terminal) {
      this.terminal = vscode.window.createTerminal({
        name: `EF Migrations`,
        env: {
          ...process.env,
          ...getEnvConfig(),
        },
      });
    }
    this.terminal.show();
    this.terminal.sendText(['cd', `"${path}"`].join(' '), true);
    this.terminal.sendText(args.join(' '), true);
  }
}
