import { Command } from './Command';
import { ConfigureAction } from '../actions/ConfigureAction';

export class ConfigureCommand extends Command {
  public static commandName = 'configure';

  constructor() {
    super();
  }

  public async run() {
    return new ConfigureAction().run();
  }
}
