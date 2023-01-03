import { TerminalColors } from '../terminal/TerminalColors';

const NEWLINE_SEPARATOR = /\r\n|\r|\n/;
const OUTPUT_PREFIX = /^([a-z]+:([\s]{1,4}))/;

export class EFOutputParser {
  private static filter(out: string, prefix: string) {
    return out
      .split(NEWLINE_SEPARATOR)
      .filter(line => !line.trim().startsWith(prefix))
      .join('\n');
  }

  public static filterInfoFromOutput(out: string): string {
    return this.filter(out, 'info:');
  }

  public static filterDataFromOutput(out: string): string {
    return this.filter(out, 'data:');
  }

  public static stripPrefixFromStdOut(output: string): string {
    return output
      .split(NEWLINE_SEPARATOR)
      .map(line => line.replace(OUTPUT_PREFIX, ''))
      .join('\n');
  }

  public static colorizeOutput(output: string): string {
    return output
      .split(NEWLINE_SEPARATOR)
      .map(line => {
        if (line.startsWith('warn:')) {
          return (
            line.replace(OUTPUT_PREFIX, `$1${TerminalColors.yellow}`) +
            TerminalColors.reset
          );
        }
        if (line.startsWith('error:')) {
          return (
            line.replace(OUTPUT_PREFIX, `$1${TerminalColors.red}`) +
            TerminalColors.reset
          );
        }
        return line;
      })
      .join('\n');
  }

  public static parse(output: string) {
    let warnings = '';
    let data = '';
    let errors = '';
    let matchedWarning = false;
    let matchedError = false;

    output.split(NEWLINE_SEPARATOR).forEach(line => {
      if (matchedWarning && !OUTPUT_PREFIX.test(line)) {
        matchedWarning = true;
      } else {
        matchedWarning = line.startsWith('warn:');
      }

      if (matchedError && !OUTPUT_PREFIX.test(line)) {
        matchedError = true;
      } else {
        matchedError = line.startsWith('error:');
      }

      const matchedData = line.startsWith('data:');

      const lineWithoutPrefix = line.replace(OUTPUT_PREFIX, '');

      if (matchedWarning) {
        warnings += lineWithoutPrefix;
      } else if (matchedError) {
        errors += lineWithoutPrefix;
      } else if (matchedData) {
        data += lineWithoutPrefix;
      }
    });

    return {
      warnings,
      errors,
      data,
    };
  }
}
