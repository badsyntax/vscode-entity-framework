import * as vscode from 'vscode';
import type { Project } from 'nuget-deps-tree';
import path from 'path';
import fs from 'fs';
import util from 'util';

import { CLI } from '../cli/CLI';
import { getCommandsConfig, getERDConfig } from '../config/config';
import { TerminalAction } from './TerminalAction';
import { DEFAULT_EFCORE_PROVIDERS, TREE_VIEW_ID } from '../constants/constants';
import { InputWizard } from '../util/InputWizard';
import { ERDiagramWebViewProvider } from '../util/ERDiagramWebViewProvider';
import { ProjectFilesProvider } from '../solution/ProjectFilesProvider';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import type { ProjectFile } from '../types/ProjectFile';
import type { ScaffoldResult } from './ScaffoldAction';
import type { Logger } from '../util/Logger';

// @ts-ignore
import mermaidTemplate from '../templates/DbContext.Mermaid.t4';

const copyFile = util.promisify(fs.copyFile);
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);

export class GenerateERDAction extends TerminalAction {
  constructor(
    private readonly logger: Logger,
    terminalProvider: TerminalProvider,
    private readonly dbContext: string,
    private readonly projectFile: ProjectFile,
    private readonly outputDir: string,
    private readonly extensionUri: vscode.Uri,
    private readonly solutionProjects?: Project[],
  ) {
    super(
      terminalProvider,
      getCommandsConfig().generateERD,
      {
        context: dbContext,
        project: projectFile.name,
      },
      projectFile.workspaceRoot,
    );
  }

  private async installTemplate(codeTemplatesPath: string) {
    const options = ['Yes', 'Cancel'];
    const answer = await vscode.window.showInformationMessage(
      'A .t4 template is required. Do you want to install the template?',
      ...options,
    );
    if (answer === 'Yes') {
      const templatePath = path.resolve(__dirname, mermaidTemplate);
      fs.mkdirSync(codeTemplatesPath, { recursive: true });
      const destPath = path.join(codeTemplatesPath, 'DbContext.Mermaid.t4');
      await copyFile(templatePath, destPath);
      return true;
    }
    return false;
  }

  public async run() {
    const projectPath = path.resolve(
      path.join(this.projectFile.workspaceRoot, this.projectFile.name),
    );
    const codeTemplatesPath = path.join(projectPath, 'CodeTemplates', 'EFCore');
    const templatePath = path.join(codeTemplatesPath, 'DbContext.Mermaid.t4');

    const finalTemplatePath = path.join(codeTemplatesPath, 'DbContext.t4');
    const finalConfigPath = path.join(
      codeTemplatesPath,
      '.mermaid.config.json',
    );
    const finalTemplatePathBackup = path.join(
      codeTemplatesPath,
      '.DbContext.t4.bak',
    );

    // Ensure the mermaid .t4 template has been installed
    const templateExists = fs.existsSync(templatePath);
    if (!templateExists) {
      const result = await this.installTemplate(codeTemplatesPath);
      if (!result) {
        return '';
      }
    }

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

    const [connectionString, provider] = await InputWizard.getInputs([
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
    ]);

    if (!connectionString || !provider) {
      return '';
    }

    const erDiagramConfig = getERDConfig();

    return vscode.window.withProgress(
      {
        title: 'Generating diagram...',
        location: { viewId: TREE_VIEW_ID },
        cancellable: true,
      },
      async (_progress, cancellationToken) => {
        cancellationToken.onCancellationRequested(() => {
          this.cancel();
        });
        try {
          // Backup any existing DbContext template
          const finalTemplatePathExists = fs.existsSync(finalTemplatePath);
          if (finalTemplatePathExists) {
            await rename(finalTemplatePath, finalTemplatePathBackup);
          }

          await copyFile(templatePath, finalTemplatePath);
          await writeFile(
            finalConfigPath,
            JSON.stringify(erDiagramConfig, null, 2),
          );
          await this.start(
            {
              ...this.params,
              connectionString,
              provider,
              outputDir: this.outputDir,
            },
            {
              asJson: true,
              removeDataFromOutput: true,
            },
          );
          const output = await this.getOutput();
          const data = CLI.getDataFromStdOut(await this.getOutput());
          const result = JSON.parse(data) as ScaffoldResult;

          const fileContents = fs.readFileSync(result.contextFile, 'utf-8');

          ERDiagramWebViewProvider.render(
            this.extensionUri,
            this.dbContext,
            fileContents,
          );

          return output;
        } catch (e) {
          const msg = `Unable to generate ER diagram: ${(e as Error).message}`;
          this.logger.error(msg);
          return '';
        } finally {
          try {
            await unlink(finalTemplatePath);
          } catch (e) {
            this.logger.error(
              'Unable to remove template file',
              (e as Error).message,
            );
          }
          try {
            await unlink(finalConfigPath);
          } catch (e) {
            this.logger.error(
              'Unable to remove template config file',
              (e as Error).message,
            );
          }
          try {
            if (fs.existsSync(finalTemplatePathBackup)) {
              await rename(finalTemplatePathBackup, finalTemplatePath);
            }
          } catch (e) {
            this.logger.error(
              'Unable to restore template backup file',
              (e as Error).message,
            );
          }
        }
      },
    );
  }
}
