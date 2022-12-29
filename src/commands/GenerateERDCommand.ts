import fs from 'fs';
import path from 'path';
import os from 'os';
import { GenerateERDAction } from '../actions/GenerateERDAction';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { type DbContextTreeItem } from '../treeView/DbContextTreeItem';
import { Command } from './Command';
import type { Logger } from '../util/Logger';
import type { DbContextWebViewProvider } from '../util/DbContextWebViewProvider';

export class GenerateERDCommand extends Command {
  public static commandName = 'generateERD';

  constructor(
    private readonly logger: Logger,
    private readonly terminalProvider: TerminalProvider,
    private readonly dbContextWebViewProvider: DbContextWebViewProvider,
    private readonly item?: DbContextTreeItem,
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
      this.dbContextWebViewProvider,
      this.item.label,
      this.item.projectFile,
      outputDir,
    ).run();
  }
}