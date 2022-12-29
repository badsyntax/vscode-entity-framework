import { useRef, useState } from 'react';
import './App.css';

import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import { Mermaid, MermaidAPI } from '../Mermaid/Mermaid';
import { ZoomControls } from '../ZoomControls/ZoomControls';

function App() {
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

  return (
    <div className="App">
      <h1>BloggingContext Entity Relationships</h1>
      <div>
        <VSCodeButton appearance={'primary'}>Export SVG</VSCodeButton>
      </div>
      <Mermaid chart={(window as any).mermaidContent} theme={(window as any).mermaidTheme} mermaidRef={mermaidApiRef} />
      <ZoomControls
        onZoomIn={handleZoomIn}
        onReset={handleReset}
        onZoomOut={handleZoomOut}
      />
    </div>
  );
}

export default App;
