import * as vscode from 'vscode';
import { getProjectsConfig } from '../config/config';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import { ProjectFilesProvider } from '../solution/ProjectFilesProvider';
import { InputWizard } from '../util/InputWizard';
import type { IAction } from './IAction';

export class ConfigureAction implements IAction {
  public async run() {
    const { projectFiles } = await ProjectFilesProvider.getProjectFiles();

    const projects = projectFiles.map(p => ({
      label: p.name,
      kind: vscode.QuickPickItemKind.Default,
    }));

    const { project: configProject, startupProject: configStartupProject } =
      getProjectsConfig();

    const [project, startupProject] = await InputWizard.getInputs([
      {
        type: 'quickpick',
        items: projects,
        value: configProject,
        options: {
          title: 'Select Project',
          ignoreFocusOut: true,
        },
        required: true,
      },
      {
        type: 'quickpick',
        items: projects,
        value: configStartupProject,
        options: {
          title: 'Select Startup Project',
          ignoreFocusOut: true,
        },
        required: true,
      },
    ]);

    if (!project || !startupProject) {
      return '';
    }
    const configuration =
      vscode.workspace.getConfiguration(EXTENSION_NAMESPACE);
    await configuration.update(
      'project',
      project,
      vscode.ConfigurationTarget.Workspace,
    );
    await configuration.update(
      'startupProject',
      startupProject,
      vscode.ConfigurationTarget.Workspace,
    );
  }
}
