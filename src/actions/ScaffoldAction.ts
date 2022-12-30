import type { Project } from 'nuget-deps-tree';
import * as vscode from 'vscode';
import { CLI } from '../cli/CLI';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import { getCommandsConfig } from '../config/config';
import { DEFAULT_EFCORE_PROVIDERS } from '../constants/constants';
import { ProjectFilesProvider } from '../solution/ProjectFilesProvider';

import type { TerminalProvider } from '../terminal/TerminalProvider';
import { projectsCache, ProjectTreeItem } from '../treeView/ProjectTreeItem';
import type { ProjectFile } from '../types/ProjectFile';
import { InputWizard } from '../util/InputWizard';

import { TerminalAction } from './TerminalAction';

export type ScaffoldResult = {
  contextFile: string;
  entityTypeFiles: string[];
};

export class ScaffoldAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    private readonly projectFile: ProjectFile,
    private readonly solutionProjects?: Project[],
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
    const defaultProvider =
      ProjectFilesProvider.getProjectPackage(
        this.solutionProjects || [this.projectFile.project],
        id => DEFAULT_EFCORE_PROVIDERS.includes(id),
        true,
      )?.id || '';

    const providerItems = DEFAULT_EFCORE_PROVIDERS.map(
      (provider): vscode.QuickPickItem => ({
        label: provider,
        kind: vscode.QuickPickItemKind.Default,
      }),
    );

    const [
      context,
      connectionString,
      provider,
      outputDir,
      contextDir,
      namespace,
    ] = await InputWizard.getInputs([
      {
        type: 'input',
        options: {
          title: 'Context Name',
          value: '',
        },
        required: true,
      },
      {
        type: 'input',
        options: {
          title: 'Connection String',
          value: '',
        },
        required: true,
      },
      {
        type: 'quickpick',
        items: providerItems,
        value: defaultProvider,
        options: {
          title: 'EFCore Provider',
        },
        required: true,
      },
      {
        type: 'input',
        options: {
          title: 'Output Directory',
          value: 'Scaffold_Out/Models',
        },
        required: true,
      },
      {
        type: 'input',
        options: {
          title: 'Context Directory',
          value: 'Scaffold_Out/Context',
        },
        required: false,
      },
      {
        type: 'input',
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
    return vscode.window.withProgress(
      {
        title: 'Scaffolding...',
        location: vscode.ProgressLocation.Window,
      },
      async () => {
        const output = JSON.parse(
          CLI.getDataFromStdOut(
            await super.run(
              {
                ...this.params,
                context,
                connectionString,
                provider,
                outputDir,
                contextDir,
                namespace,
              },
              {
                asJson: true,
              },
            ),
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
      },
    );
  }
}
