import React, { useRef } from 'react';
import './App.css';

import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import type { MermaidAPI } from '../Mermaid/Mermaid';
import { Mermaid } from '../Mermaid/Mermaid';
import { ZoomControls } from '../ZoomControls/ZoomControls';

export function App() {
  const mermaidApiRef = useRef<MermaidAPI>();

  const handleZoomIn = () => {
    mermaidApiRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mermaidApiRef.current?.zoomOut();
  };

  const handleReset = () => {
    mermaidApiRef.current?.reset();
  };

  const handleExportSvg = () => {
    const vscode = acquireVsCodeApi();
    // @ts-ignore
    const svg = mermaidApiRef.current?.getSvg()?.node()?.outerHTML;
    if (svg) {
      vscode.postMessage({
        command: 'exportSvg',
        text: svg,
      });
    }
  };

  return (
    <div className="App">
      <h1>{(window as any).erDiagramTitle}</h1>
      <div>
        <VSCodeButton appearance={'primary'} onClick={handleExportSvg}>
          Export SVG
        </VSCodeButton>
      </div>
      <Mermaid
        chart={(window as any).mermaidContent}
        theme={(window as any).mermaidTheme}
        mermaidRef={mermaidApiRef}
      />
      <ZoomControls
        onZoomIn={handleZoomIn}
        onReset={handleReset}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}
