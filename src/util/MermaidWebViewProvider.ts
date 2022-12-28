import * as vscode from 'vscode';
import { EXTENSION_NAMESPACE } from '../constants/constants';
import { Disposable } from './Disposable';

export class MermaidWebViewProvider extends Disposable {
  private panel: vscode.WebviewPanel | undefined;
  constructor() {
    super();
  }

  public show(mermaidContent: string) {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        `${EXTENSION_NAMESPACE}-mermaid`,
        'Entity Relationship Diagram',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        },
      );
      this.subscriptions.push(this.panel);
    }

    this.panel.webview.html = getWebviewContent(mermaidContent);
    console.log('html', this.panel.webview.html);
  }
}

function getWebviewContent(mermaidContent: string) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
    </head>
    <body>
      <pre class="mermaid">
      ${mermaidContent}
      </pre>
      <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@9/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
      </script>
    </body>
  </html>`;
}
