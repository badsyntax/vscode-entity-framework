import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import { Disposable } from './Disposable';

export class DbContextWebViewProvider extends Disposable {
  private panel: vscode.WebviewPanel | undefined;
  constructor(private readonly extensionUri: vscode.Uri) {
    super();
  }

  public render(dbContext: string, mermaidContent: string) {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        `${EXTENSION_NAMESPACE}-dbcontext`,
        'Entity Relationship Diagram',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        },
      );
      this.subscriptions.push(this.panel);
      this.setWebviewMessageListener(this.panel.webview);
    }

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
  const toolkitUri = getUri(webview, extensionUri, [
    'node_modules',
    '@vscode',
    'webview-ui-toolkit',
    'dist',
    'toolkit.js',
  ]);

  const mainUri = getUri(webview, extensionUri, ['webview-ui', 'main.js']);

  return `<!DOCTYPE html>
  <html lang="en" style="height:100%">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script type="module" src="${toolkitUri}"></script>
      <script type="module" src="${mainUri}"></script>
      <script src="https://cdn.jsdelivr.net/npm/d3@7.8.0/dist/d3.min.js"></script>
      <style type="text/css">
      .mermaid svg {
        height: 100%;
        width: 100%;
        max-width: 100% !important;
      }
      </style>
    </head>
    <body style="height:100%">
      <div style="display:flex;height:100%;flex-direction:column">
        <h1>${dbContext} Entity Relationships</h1>
        <div><vscode-button id="export-svg-button">Export SVG</vscode-button></div>
        <pre class="mermaid" id="mermaid" style="text-align:center;overflow:hidden;flex-grow:1">
        ${mermaidContent}
        </pre>
      </div>
      <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true, theme: '${mermaidTheme}' });
      </script>
    </body>
  </html>`;
}
