import type { Project } from 'nuget-deps-tree';
import * as vscode from 'vscode';
import { EFOutputParser } from '../cli/EFOutputParser';
import { CommandProvider } from '../commands/CommandProvider';
import { RefreshTreeCommand } from '../commands/RefreshTreeCommand';
import { getCommandsConfig } from '../config/config';
import { DEFAULT_EFCORE_PROVIDERS, TREE_VIEW_ID } from '../constants/constants';
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
        location: { viewId: TREE_VIEW_ID },
        cancellable: true,
      },
      async (_progress, cancellationToken) => {
        cancellationToken.onCancellationRequested(() => {
          this.cancel();
        });
        await this.start(
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
        );

        const { data } = EFOutputParser.parse(await this.getOutput());
        const output = JSON.parse(data) as ScaffoldResult;
        const uri = vscode.Uri.file(output.contextFile);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
        return '';
      },
    );
  }
}
