import { defaultTerminalCommands } from '../terminal/defaultTerminalCommands';
import type { TerminalProvider } from '../terminal/TerminalProvider';
import { TerminalAction } from './TerminalAction';

export class RemoveMigrationAction extends TerminalAction {
  constructor(
    terminalProvider: TerminalProvider,
    workspaceRoot: string,
    dbcontext: string,
    project: string,
  ) {
    super(
      terminalProvider,
      defaultTerminalCommands.removeMigration,
      {
        dbcontext,
        project,
      },
      workspaceRoot,
    );
  }
}
