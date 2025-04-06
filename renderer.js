console.log("Renderer Loaded. Shell is active.");

let zoomLevel = 1;

window.electronAPI.onZoom((action) => {
  const box = document.getElementById('stealth-box');

  if (action === 'in') zoomLevel = Math.min(2.5, zoomLevel + 0.1);
  else if (action === 'out') zoomLevel = Math.max(0.5, zoomLevel - 0.1);
  else if (action === 'reset') zoomLevel = 1;

  box.style.transform = `scale(${zoomLevel})`;
  updateLog(` Zoom: ${(zoomLevel * 100).toFixed(0)}%`);
});

window.electronAPI.onLog((msg) => updateLog(msg));

function updateLog(msg) {
  document.getElementById('log').innerText = msg;
}
