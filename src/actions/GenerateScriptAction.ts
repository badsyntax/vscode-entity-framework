import * as vscode from 'vscode';

import { extractDataFromStdOut } from '../cli/ef';
import { getCommandsConfig } from '../config/config';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TerminalAction } from './TerminalAction';

export class GenerateScriptAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    workspaceRoot: string,
    dbContext: string,
    project: string,
  ) {
    super(
      terminalProvider,
      getCommandsConfig().generateScript,
      {
        dbContext,
        project,
      },
      workspaceRoot,
    );
  }

  public async run() {
    const output = extractDataFromStdOut(await super.run());
    const uri = vscode.Uri.parse('ef-script:' + output);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.languages.setTextDocumentLanguage(doc, 'sql');
    await vscode.window.showTextDocument(doc, { preview: false });
    return output;
  }
}
