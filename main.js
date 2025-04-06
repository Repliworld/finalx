const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

let win;
let isVisible = true;
let opacity = 1;
const moveStep = 10;

function createWindow() {
    win = new BrowserWindow({
      width: 600,
      height: 400,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      hasShadow: false,
      resizable: false,
      fullscreenable: false,
      focusable: true, // <-- allow you to see + debug
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        offscreen: false // <-- CRITICAL: you need to see it
      }
    });
  
    win.setIgnoreMouseEvents(true, { forward: true }); // <-- transparent but interactive
    win.setOpacity(0.2); // adjust for visibility
    win.loadFile('renderer.html');
  }
  

function registerShortcuts() {
  const register = (combo, callback) => {
    const ok = globalShortcut.register(combo, callback);
    if (!ok) console.warn(`❌ Failed to register in the server : ${combo}`);
  };

  let clickThrough = true;

globalShortcut.register('Control+Shift+I', () => {
  clickThrough = !clickThrough;
  win.setIgnoreMouseEvents(clickThrough, { forward: true });
  console.log(`🖱️ Mouse Interactions: ${clickThrough ? 'OFF (Stealth)' : 'ON (Debug)'}`);
});


  // Visibility toggle
  globalShortcut.register('Control+Shift+B', () => {
    opacity = 1;
    win.setOpacity(opacity);
    win.center(); // bring it back to center of screen
    win.show();   // show in case it's hidden
    console.log('🛑 Panic Reset: Window centered & opacity set to 100%');
  });
  

  // Quit
  register('Control+Q', () => {
    console.log('[Ctrl+Q] Quitting App...');
    app.quit();
  });

  // Screenshot triggers
  register('Control+H', () => {
    console.log('[Ctrl+H] Screenshot Triggered');
    win.webContents.send('log', '📸 Screenshot Captured');
  });

  register('Control+L', () => {
    console.log('[Ctrl+L] Delete Last Screenshot');
    win.webContents.send('log', '🗑️ Last Screenshot Deleted');
  });

  register('Control+Enter', () => {
    console.log('[Ctrl+Enter] Process Screenshot');
    win.webContents.send('log', '⚙️ Processing Screenshot...');
  });

  register('Control+R', () => {
    console.log('[Ctrl+R] Start New Problem');
    win.webContents.send('log', '🔄 Starting New Problem');
  });

  // Opacity control
  register('Control+[', () => {
    opacity = Math.max(0.1, opacity - 0.1);
    win.setOpacity(opacity);
    win.webContents.send('log', `➖ Opacity: ${Math.round(opacity * 100)}%`);
  });

  register('Control+]', () => {
    opacity = Math.min(1, opacity + 0.1);
    win.setOpacity(opacity);
    win.webContents.send('log', `➕ Opacity: ${Math.round(opacity * 100)}%`);
  });

  // Zoom control (handled in renderer)
  const zoomCombos = [
    { combo: 'Control+-', action: 'out' },
    { combo: 'Control+_', action: 'out' },
    { combo: 'Control+0', action: 'reset' },
    { combo: 'Control+=', action: 'in' },
    { combo: 'Control+Plus', action: 'in' },
    { combo: 'Control+Shift+Plus', action: 'in' },
  ];

  for (const { combo, action } of zoomCombos) {
    const registered = globalShortcut.register(combo, () => {
      win.webContents.send('zoom', action);
      console.log(`[${combo}] Zoom ${action}`);
    });
    if (!registered) console.warn(`❌ Failed to register zoom combo: ${combo}`);
  }

  // Movable window shortcuts
  register('Control+Left', () => {
    const { x, y } = win.getBounds();
    win.setBounds({ x: x - moveStep, y });
    console.log('[Ctrl+←] Move Left');
  });

  register('Control+Right', () => {
    const { x, y } = win.getBounds();
    win.setBounds({ x: x + moveStep, y });
    console.log('[Ctrl+→] Move Right');
  });

  register('Control+Up', () => {
    const { x, y } = win.getBounds();
    win.setBounds({ x, y: y - moveStep });
    console.log('[Ctrl+↑] Move Up');
  });

  register('Control+Down', () => {
    const { x, y } = win.getBounds();
    win.setBounds({ x, y: y + moveStep });
    console.log('[Ctrl+↓] Move Down');
  });
}

app.whenReady().then(() => {
  createWindow();
  registerShortcuts();
});

app.on('will-quit', () => globalShortcut.unregisterAll());
