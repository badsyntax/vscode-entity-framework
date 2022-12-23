import { defaultTerminalCommands } from '../terminal/defaultTerminalCommands';
import { TerminalAction } from './TerminalAction';

export class GenerateScriptAction extends TerminalAction {
  constructor(workspaceRoot: string, dbcontext: string, project: string) {
    super(
      defaultTerminalCommands.generateScript,
      {
        dbcontext,
        project,
      },
      workspaceRoot,
    );
  }
}
