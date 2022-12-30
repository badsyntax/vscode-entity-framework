import { VSCodeButton } from '@vscode/webview-ui-toolkit/react';
import './ZoomControls.css';

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export function ZoomControls({ onReset, onZoomIn, onZoomOut }: Props) {
  return (
    <div className="zoom-controls">
      <VSCodeButton onClick={onZoomIn}>Zoom In</VSCodeButton>
      <VSCodeButton onClick={onZoomOut}>Zoom Out</VSCodeButton>
      <VSCodeButton onClick={onReset}>Reset</VSCodeButton>
    </div>
  );
}
