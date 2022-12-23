import { getCommandsConfig } from '../config/config';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TerminalAction } from './TerminalAction';

export class GenerateScriptAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    workspaceRoot: string,
    dbcontext: string,
    project: string,
  ) {
    super(
      terminalProvider,
      getCommandsConfig().generateScript,
      {
        dbcontext,
        project,
      },
      workspaceRoot,
    );
  }
}
