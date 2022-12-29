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
  generateERD: string[];
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
      generateERD: [],
      listDbContexts: [],
      listMigrations: [],
      dbContextInfo: [],
      scaffold: [],
    });
}

type ERDiagramConfig = {
  ignoreTables: string[];
};

export function getERDConfig() {
  return vscode.workspace
    .getConfiguration(EXTENSION_NAMESPACE)
    .get<ERDiagramConfig>('erDiagram', {
      ignoreTables: [],
    });
}
