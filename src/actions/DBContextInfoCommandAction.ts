import * as vscode from 'vscode';

import { CLI } from '../cli/CLI';
import { getCommandsConfig } from '../config/config';

import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TextDocumentProvider } from '../util/TextDocumentProvider';
import { TerminalAction } from './TerminalAction';

export class DBContextInfoCommandAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    workspaceRoot: string,
    dbContext: string,
    project: string,
  ) {
    super(
      terminalProvider,
      getCommandsConfig().dbContextInfo,
      {
        dbContext,
        project,
      },
      workspaceRoot,
    );
  }

  public async run() {
    const output = CLI.getDataFromStdOut(await super.run());
    const uri = vscode.Uri.parse(`${TextDocumentProvider.scheme}:${output}`);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.languages.setTextDocumentLanguage(doc, 'json');
    await vscode.window.showTextDocument(doc, { preview: false });
    return output;
  }
}
