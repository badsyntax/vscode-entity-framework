import * as vscode from 'vscode';
import { OUTPUT_CHANNEL_ID } from '../constants/constants';

type LogType = 'info' | 'warning' | 'error' | 'debug';

export class Logger {
  private readonly channel: vscode.OutputChannel;

  constructor() {
    this.channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_ID);
  }

  private log(message: string, type: LogType): void {
    const logMessage = this.format(message, type);
    this.channel.appendLine(logMessage);
  }

  public format(message: string, type: LogType): string {
    return `[${type}] ${message}`;
  }

  public info(...messages: string[]): void {
    this.log(messages.join(' '), 'info');
  }

  public warning(...messages: string[]): void {
    this.log(messages.join(' '), 'warning');
  }

  public error(...messages: string[]): void {
    this.log(messages.join(' '), 'error');
  }

  public debug(...messages: string[]): void {
    this.log(messages.join(' '), 'debug');
  }
}
