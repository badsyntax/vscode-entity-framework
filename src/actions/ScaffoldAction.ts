import * as vscode from 'vscode';
import { CLI } from '../cli/CLI';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import { getCommandsConfig } from '../config/config';
import { DEFAULT_EFCORE_PROVIDERS } from '../constants/constants';

import type { TerminalProvider } from '../terminal/TerminalProvider';
import { projectsCache, ProjectTreeItem } from '../treeView/ProjectTreeItem';
import type { ProjectFile } from '../types/ProjectFile';
import { InputWizard } from '../util/InputWizard';

import { TerminalAction } from './TerminalAction';

type ScaffoldResult = {
  contextFile: string;
  entityTypeFiles: string[];
};

export class ScaffoldAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    private readonly projectFile: ProjectFile,
  ) {
    super(
      terminalProvider,
      getCommandsConfig().scaffold,
      {
        project: projectFile.name,
      },
      projectFile.workspaceRoot,
    );
  }

  public async run() {
    const packages = this.projectFile.project.packages || [];
    const defaultProvider =
      packages.find(pkg => DEFAULT_EFCORE_PROVIDERS.includes(pkg.name))?.name ||
      '';
    const [
      context,
      connectionString,
      provider,
      outputDir,
      contextDir,
      namespace,
    ] = await InputWizard.getInputs([
      {
        options: {
          title: 'Context Name',
          value: '',
        },
        required: true,
      },
      {
        options: {
          title: 'Connection String',
          value: '',
        },
        required: true,
      },
      {
        options: {
          title: 'EFCore Provider',
          value: defaultProvider,
        },
        required: true,
      },
      {
        options: {
          title: 'Output Directory',
          value: 'Scaffold_Out/Models',
        },
        required: true,
      },
      {
        options: {
          title: 'Context Directory',
          value: 'Scaffold_Out/Context',
        },
        required: false,
      },
      {
        options: {
          title: 'Namespace',
          value: '',
        },
        required: false,
      },
    ]);

    if (!context || !connectionString || !provider || !outputDir) {
      return '';
    }
    const output = JSON.parse(
      CLI.getDataFromStdOut(
        await super.run({
          ...this.params,
          context,
          connectionString,
          provider,
          outputDir,
          contextDir,
          namespace,
        }),
      ),
    ) as ScaffoldResult;

    const uri = vscode.Uri.file(output.contextFile);
    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);

    const cacheId = ProjectTreeItem.getCacheId(
      this.projectFile.workspaceRoot,
      this.projectFile.name,
    );
    projectsCache.clear(cacheId);
    await vscode.commands.executeCommand(
      CommandProvider.getCommandName(RefreshTreeCommand.commandName),
      false,
    );
    return '';
  }
}
