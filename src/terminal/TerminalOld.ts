import * as vscode from 'vscode';
import { getEnvConfig } from '../config/config';

export class TerminalOld {
  private static terminal: vscode.Terminal | undefined;

  public static run(args: string[], path: string) {
    if (!this.terminal) {
      vscode.window.onDidCloseTerminal(async t => {
        if (t.exitStatus && t.exitStatus.code) {
          await vscode.window.showInformationMessage(
            `Exit code: ${t.exitStatus.code}`,
          );
        }
      });

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
    this.terminal.sendText('; exit');
  }
}
