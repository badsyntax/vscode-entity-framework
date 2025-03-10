import fs from 'fs';
import path from 'path';
import os from 'os';
import type * as vscode from 'vscode';
import { GenerateERDAction } from '../actions/GenerateERDAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';
import type { Logger } from '../util/Logger';
import { ProjectFilesProvider } from '../solution/ProjectFilesProvider';

export class GenerateERDCommand extends Command {
  public static commandName = 'generateERD';

  constructor(
    private readonly logger: Logger,
    private readonly terminalProvider: TerminalProvider,
    private readonly extensionUri: vscode.Uri,
    private readonly item?: DbContextTreeItem,
  ) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-erd'));
    const { solutionProjects } = await ProjectFilesProvider.getProjectFiles();
    return new GenerateERDAction(
      this.logger,
      this.terminalProvider,
      this.item.label,
      this.item.projectFile,
      outputDir,
      this.extensionUri,
      solutionProjects,
    ).run();
  }
}
