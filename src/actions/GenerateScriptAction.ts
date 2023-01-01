import * as vscode from 'vscode';

import { CLI } from '../cli/CLI';
import { getCommandsConfig } from '../config/config';
import { TREE_VIEW_ID } from '../constants/constants';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TextDocumentProvider } from '../util/TextDocumentProvider';
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
    return vscode.window.withProgress(
      {
        title: 'Generating script...',
        location: { viewId: TREE_VIEW_ID },
        cancellable: true,
      },
      async (_progress, cancellationToken) => {
        cancellationToken.onCancellationRequested(() => {
          this.cancel();
        });
        await this.start(undefined, {
          removeDataFromOutput: true,
        });
        const output = CLI.getDataFromStdOut(await this.getOutput());
        const uri = vscode.Uri.parse(
          `${TextDocumentProvider.scheme}:${output}`,
        );
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.languages.setTextDocumentLanguage(doc, 'sql');
        await vscode.window.showTextDocument(doc, { preview: false });
        return output;
      },
    );
  }
}
