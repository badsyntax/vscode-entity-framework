import * as vscode from 'vscode';

type Input = {
  options: vscode.InputBoxOptions;
  required: boolean;
};

export class InputWizard {
  public static async getInputs(inputs: Input[]): Promise<string[]> {
    const inputValues: string[] = [];
    for (const input of inputs) {
      const inputVal = await vscode.window.showInputBox({
        ...input.options,
        ignoreFocusOut: true,
        title: input.required
          ? input.options.title
          : `${input.options.title} (Optional)`,
      });
      if (inputVal === undefined) {
        return [];
      }
      if (input.required && !inputVal) {
        await vscode.window.showErrorMessage('Invalid input');
        return [];
      }
      inputValues.push(inputVal);
    }
    return inputValues;
  }
}
