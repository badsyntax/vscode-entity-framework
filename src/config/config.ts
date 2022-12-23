import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';

type EnvConfig = {
  [key: string]: string;
};

export function getEnvConfig() {
  return vscode.workspace
    .getConfiguration(EXTENSION_NAMESPACE)
    .get<EnvConfig>('env', {});
}
