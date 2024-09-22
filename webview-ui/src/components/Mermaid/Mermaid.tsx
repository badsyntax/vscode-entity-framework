import React, { useEffect, useImperativeHandle, useRef } from 'react';
import mermaid from 'mermaid';
import * as d3 from 'd3';
import { VscWarning } from 'react-icons/vsc';
import './Mermaid.css';

export type MermaidAPI = {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getSvg: () =>
    | d3.Selection<d3.BaseType, unknown, HTMLElement, any>
    | undefined;
};

export function Mermaid({
  chart,
  mermaidRef,
  theme,
}: {
  chart: string;
  mermaidRef?: React.MutableRefObject<MermaidAPI | undefined>;
  theme: 'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null';
}) {
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown>>();
  const svgRef = useRef<d3.Selection<d3.BaseType, unknown, HTMLElement, any>>();

  useEffect(() => {
    void (async () => {
      mermaid.initialize({
        startOnLoad: true,
        theme,
      });
      await mermaid.run();

      const svg = d3.select('.mermaid svg');
      if (!svg.node()) {
        return;
      }

      const hasEntities = !!document.querySelector(
        '.mermaid svg g[id^="entity"]',
      );

      if (hasEntities) {
        document.body.classList.add('mermaid-has-entities');

        svg.html('<g>' + svg.html() + '</g>');

        const inner = svg.select('g');
        const zoom = d3.zoom().on('zoom', function (event) {
          inner.attr('transform', event.transform);
        });
        // @ts-ignore
        svg.call(zoom);

        svgRef.current = svg;
        zoomRef.current = zoom;
      } else {
        document.body.classList.add('mermaid-has-no-entities');
      }
    })();
  }, []);

  useImperativeHandle(mermaidRef, () => ({
    reset() {
      svgRef.current
        ?.transition()
        // @ts-ignore
        .call(zoomRef.current.scaleTo, 1);
    },
    zoomIn() {
      svgRef.current
        ?.transition()
        // @ts-ignore
        .call(zoomRef.current.scaleBy, 2);
    },
    zoomOut() {
      svgRef.current
        ?.transition()
        // @ts-ignore
        .call(zoomRef.current.scaleBy, 0.5);
    },
    getSvg() {
      return svgRef.current;
    },
  }));

  return (
    <>
      <div className="no-entities">
        <h2 className="no-entities-header">
          <VscWarning /> No Entities Were Generated
        </h2>
      </div>
      <pre className="mermaid" id="mermaid">
        {chart}
      </pre>
    </>
  );
}
