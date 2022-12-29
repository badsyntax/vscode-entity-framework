import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import mermaid from 'mermaid';
import * as d3 from 'd3';
import './Mermaid.css';



export type MermaidAPI = {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

export function Mermaid({
  chart,
  mermaidRef,
  theme
}: {
  chart: string;
  mermaidRef?: React.MutableRefObject<MermaidAPI | undefined>;
  theme: string
}) {
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown>>();
  const svgRef =
    useRef<d3.Selection<d3.BaseType, unknown, HTMLElement, any>>();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme,
    });
    mermaid.contentLoaded();
    
    var svg = d3.select('.mermaid svg');
    svg.html('<g>' + svg.html() + '</g>');

    var inner = svg.select('g');
    var zoom = d3.zoom().on('zoom', function (event) {
      inner.attr('transform', event.transform);
    });
    // @ts-ignore
    svg.call(zoom);

    svgRef.current = svg;
    zoomRef.current = zoom;
  }, []);

  useImperativeHandle(mermaidRef, () => ({
    reset() {
      svgRef.current?.transition()
        // @ts-ignore
        .call(zoomRef.current.scaleTo, 1);
    },
    zoomIn() {
      svgRef.current?.transition()
        // @ts-ignore
        .call(zoomRef.current.scaleBy, 2);
    },
    zoomOut() {
      svgRef.current?.transition()
        // @ts-ignore
        .call(zoomRef.current.scaleBy, 0.5);
    },
  }));

  return (
    <pre className="mermaid" id="mermaid">
      {chart}
    </pre>
  );
}
