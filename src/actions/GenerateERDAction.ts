import * as vscode from 'vscode';

import { CLI } from '../cli/CLI';
import { getCommandsConfig } from '../config/config';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TerminalAction } from './TerminalAction';
import path from 'path';
import fs from 'fs';
import util from 'util';

// @ts-ignore
import mermaidTemplate from '../templates/DbContext.Mermaid.t4';
import type { ProjectFile } from '../types/ProjectFile';
import { DEFAULT_EFCORE_PROVIDERS } from '../constants/constants';
import { InputWizard } from '../util/InputWizard';
import type { ScaffoldResult } from './ScaffoldAction';
import type { MermaidWebViewProvider } from '../util/MermaidWebViewProvider';
import type { Logger } from '../util/Logger';

const copyFile = util.promisify(fs.copyFile);
const rename = util.promisify(fs.rename);
const unlink = util.promisify(fs.unlink);

export class GenerateERDAction extends TerminalAction {
  constructor(
    private readonly logger: Logger,
    terminalProvider: TerminalProvider,
    private readonly mermaidWebViewProvider: MermaidWebViewProvider,
    dbContext: string,
    private readonly projectFile: ProjectFile,
    private readonly outputDir: string,
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
      'Do you want to install the templates?',
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

    const packages = this.projectFile.project.packages || [];
    const defaultProvider =
      packages.find(pkg => DEFAULT_EFCORE_PROVIDERS.includes(pkg.name))?.name ||
      '';

    const [connectionString, provider] = await InputWizard.getInputs([
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
    ]);

    if (!connectionString || !provider) {
      return '';
    }

    try {
      // Backup any existing DbContext template
      const finalTemplatePathExists = fs.existsSync(finalTemplatePath);
      if (finalTemplatePathExists) {
        await rename(finalTemplatePath, finalTemplatePathBackup);
      }

      await copyFile(templatePath, finalTemplatePath);
      const output = CLI.getDataFromStdOut(
        await super.run(
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
        ),
      );

      const result = JSON.parse(output) as ScaffoldResult;

      const fileContents = fs.readFileSync(result.contextFile, 'utf-8');

      this.mermaidWebViewProvider.show(fileContents);

      return output;
    } catch (e) {
      this.logger.error('Unable to generate ER diagram', (e as Error).message);
      return '';
    } finally {
      await unlink(finalTemplatePath);
      if (fs.existsSync(finalTemplatePathBackup)) {
        await rename(finalTemplatePathBackup, finalTemplatePath);
      }
    }
  }
}
