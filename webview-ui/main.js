const vscode = acquireVsCodeApi();

window.addEventListener('load', main);

function main() {
  const exportSvgButton = document.getElementById('export-svg-button');
  exportSvgButton.addEventListener('click', () =>
    vscode.postMessage({
      command: 'exportSvg',
      text: new XMLSerializer().serializeToString(
        document.getElementById('mermaid').firstChild,
      ),
    }),
  );
}
