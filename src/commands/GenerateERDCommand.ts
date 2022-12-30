import fs from 'fs';
import path from 'path';
import os from 'os';
import type * as vscode from 'vscode';
import { GenerateERDAction } from '../actions/GenerateERDAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';
import type { Logger } from '../util/Logger';
import type { Project } from 'nuget-deps-tree';

export class GenerateERDCommand extends Command {
  public static commandName = 'generateERD';

  constructor(
    private readonly logger: Logger,
    private readonly terminalProvider: TerminalProvider,
    private readonly extensionUri: vscode.Uri,
    private readonly item?: DbContextTreeItem,
    private readonly solutionProjects?: Project[],
  ) {
    super();
  }

  public async run() {
    if (!this.item) {
      return;
    }
    const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mermaid-erd'));
    return new GenerateERDAction(
      this.logger,
      this.terminalProvider,
      this.item.label,
      this.item.projectFile,
      outputDir,
      this.extensionUri,
      this.solutionProjects,
    ).run();
  }
}
