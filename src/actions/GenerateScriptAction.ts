import { getCommandsConfig } from '../config/config';
import type { TerminalProvider } from '../terminal/TerminalProvider';
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
}
