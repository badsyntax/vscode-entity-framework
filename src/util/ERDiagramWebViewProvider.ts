import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import { Disposable } from './Disposable';

export class ERDiagramWebViewProvider extends Disposable {
  public static currentProvider: ERDiagramWebViewProvider | undefined;

  constructor(
    private readonly panel: vscode.WebviewPanel,
    private readonly extensionUri: vscode.Uri,
    dbContext: string,
    mermaidContent: string,
  ) {
    super();
    this.setWebviewMessageListener(this.panel.webview);
    this.subscriptions.push(this.panel);
    this.panel.onDidDispose(() => this.dispose(), null, this.subscriptions);

    const activeTheme = vscode.window.activeColorTheme;
    const mermaidTheme =
      activeTheme.kind === vscode.ColorThemeKind.Dark ? 'dark' : 'default';

    this.panel.webview.html = getWebviewContent(
      dbContext,
      this.panel.webview,
      this.extensionUri,
      mermaidContent,
      mermaidTheme,
    );
  }

  public dispose(): void {
    super.dispose();
    ERDiagramWebViewProvider.currentProvider = undefined;
  }

  public static render(
    extensionUri: vscode.Uri,
    dbContext: string,
    mermaidContent: string,
  ) {
    if (ERDiagramWebViewProvider.currentProvider) {
      ERDiagramWebViewProvider.currentProvider.panel.reveal(
        vscode.ViewColumn.One,
      );
    } else {
      const panel = vscode.window.createWebviewPanel(
        `${EXTENSION_NAMESPACE}-dbcontext`,
        'Entity Relationship Diagram',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        },
      );
      ERDiagramWebViewProvider.currentProvider = new ERDiagramWebViewProvider(
        panel,
        extensionUri,
        dbContext,
        mermaidContent,
      );
    }
  }

  private setWebviewMessageListener(webview: vscode.Webview) {
    this.subscriptions.push(
      webview.onDidReceiveMessage(async (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case 'exportSvg':
            const doc = await vscode.workspace.openTextDocument({
              language: 'xml',
              content: text,
            });
            await vscode.window.showTextDocument(doc, { preview: false });
            return;
        }
      }),
    );
  }
}

export function getUri(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  pathList: string[],
) {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathList));
}

function getWebviewContent(
  dbContext: string,
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  mermaidContent: string,
  mermaidTheme: 'dark' | 'default',
) {
  const stylesUri = getUri(webview, extensionUri, [
    'webview-ui',
    'build',
    'assets',
    'index.css',
  ]);
  const scriptUri = getUri(webview, extensionUri, [
    'webview-ui',
    'build',
    'assets',
    'index.js',
  ]);

  return /*html*/ `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="${stylesUri}">
        <title>ER Diagram</title>
      </head>
      <body>
        <script>
          window['mermaidContent'] = \`${mermaidContent}\`;
          window['mermaidTheme'] = '${mermaidTheme}';
          window['erDiagramTitle'] = '${dbContext} Entity Relationships';
        </script>
        <div id="root"></div>
        <script type="module" src="${scriptUri}"></script>
      </body>
    </html>
   `;
}
