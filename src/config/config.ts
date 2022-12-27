import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';

type EnvConfig = {
  [key: string]: string;
};

type CommandsConfig = {
  addMigration: string[];
  removeMigration: string[];
  runMigration: string[];
  generateScript: string[];
  listDbContexts: string[];
  listMigrations: string[];
  dbContextInfo: string[];
  scaffold: string[];
};

export function getEnvConfig() {
  return vscode.workspace
    .getConfiguration(EXTENSION_NAMESPACE)
    .get<EnvConfig>('env', {});
}

export function getCommandsConfig() {
  return vscode.workspace
    .getConfiguration(EXTENSION_NAMESPACE)
    .get<CommandsConfig>('commands', {
      addMigration: [],
      removeMigration: [],
      runMigration: [],
      generateScript: [],
      listDbContexts: [],
      listMigrations: [],
      dbContextInfo: [],
      scaffold: [],
    });
}
