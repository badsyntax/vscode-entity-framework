import { defaultTerminalCommands } from '../terminal/defaultTerminalCommands';
import { TerminalAction } from './TerminalAction';

export class RemoveMigrationAction extends TerminalAction {
  constructor(workspaceRoot: string, dbcontext: string, project: string) {
    super(
      defaultTerminalCommands.removeMigration,
      {
        dbcontext,
        project,
      },
      workspaceRoot,
    );
  }
}
