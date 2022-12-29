const vscode = acquireVsCodeApi();

window.addEventListener('load', main);

function main() {
  const exportSvgButton = document.getElementById('export-svg-button');
  setTimeout(() => {
    var svgs = d3.selectAll('.mermaid svg');
    svgs.each(function () {
      var svg = d3.select(this);
      svg.html('<g>' + svg.html() + '</g>');
      var inner = svg.select('g');
      var zoom = d3.zoom().on('zoom', function (event) {
        inner.attr('transform', event.transform);
      });
      svg.call(zoom);

      // TODO
      // Set initial zoom
      // var transform = d3.zoomIdentity.scale(5);
      // svg.call(zoom.transform, transform);
    });
  });
  exportSvgButton.addEventListener('click', () =>
    vscode.postMessage({
      command: 'exportSvg',
      text: new XMLSerializer().serializeToString(
        document.getElementById('mermaid').firstChild,
      ),
    }),
  );
}
