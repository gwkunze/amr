import { app, BrowserWindow, globalShortcut, ipcMain, screen, Menu, shell } from 'electron';
import path from 'path';
import { Jobs } from './game';
import { loadState, loadInstances, getInstances, saveState } from './stateStore';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const isMac = process.platform === 'darwin';

let overlayWindow: BrowserWindow;
let selectorWindow: BrowserWindow;
let pendingFocus = false;


const createOverlayWindow = async (monitor: number) => {
  overlayWindow = new BrowserWindow({
    fullscreen: true,
    transparent: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: ['overlay'],
    },
    alwaysOnTop: true,
    skipTaskbar: true,
  });

  // and load the index.html of the app.
  if (WINDOW_VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(WINDOW_VITE_DEV_SERVER_URL);
  } else {
    overlayWindow.loadFile(path.join(__dirname, `../renderer/${WINDOW_VITE_NAME}/index.html`));
  }

  overlayWindow.setIgnoreMouseEvents(true, { forward: true });
  if (monitor !== null) {
    const bounds = screen.getAllDisplays()[monitor].bounds;
    overlayWindow.setPosition(bounds.x, bounds.y);
  }
  overlayWindow.on('closed', () => { overlayWindow = null; });
};

const createSelectorWindow = async (monitor: number) => {
  selectorWindow = new BrowserWindow({
    height: 1024,
    width: 1792,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: ['selector'],
    }
  });

  // and load the index.html of the app.
  if (WINDOW_VITE_DEV_SERVER_URL) {
    selectorWindow.loadURL(WINDOW_VITE_DEV_SERVER_URL);
  } else {
    selectorWindow.loadFile(path.join(__dirname, `../renderer/${WINDOW_VITE_NAME}/index.html`));
  }

  if (monitor !== null) {
    const bounds = screen.getAllDisplays()[monitor].bounds;
    selectorWindow.setPosition(bounds.x, bounds.y);
  }
  selectorWindow.on('closed', () => { selectorWindow = null; });
  selectorWindow.on('close', () => {
    overlayWindow.close();
  });
  selectorWindow.on('focus', () => {
    if (pendingFocus) {
      selectorWindow.webContents.send('focus-filter');
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  await loadInstances();
  const state = loadState();

  const pushState = () => {
    saveState();
    if (overlayWindow) {
      overlayWindow.webContents.send('update-state', state);
    }
    if (selectorWindow) {
      selectorWindow.webContents.send('update-state', state);
    }
  };

  ipcMain.handle('get-instances', () => {
    return getInstances();
  });

  ipcMain.handle('get-jobs', () => {
    return Jobs;
  });

  ipcMain.handle('get-state', () => {
    return state;
  });

  ipcMain.handle('get-monitors', () => {
    const allDisplays = screen.getAllDisplays();
    const [x, y] = overlayWindow.getPosition()

    return allDisplays.map(({ bounds, label, size }, index) => ({
      bounds,
      index,
      label,
      size,
      current: (x == bounds.x && y == bounds.y),
    }));
  });

  ipcMain.on('set-instance', (event, { instance, blur }) => {
    selectorWindow.setTitle(`A Memory Reborn - ${instance.name}`);
    if (blur) selectorWindow.blur();

    state.instance = instance;
    state.encounter = 0;
    pushState();
  });

  ipcMain.on('set-encounter', (event, encounter) => {
    if (!overlayWindow || state.instance === null) return;
    state.encounter = Math.max(0, Math.min(encounter, state.instance.encounters.length - 1));
    pushState();
  });

  ipcMain.on('set-job', (event, job) => {
    state.job = job;
    pushState();
  });

  ipcMain.on('set-monitor', (event, index) => {
    const display = screen.getAllDisplays()[index];

    state.monitor = index;

    overlayWindow.setPosition(display.bounds.x, display.bounds.y);

    pushState();
    // TODO (low prio): Flash something on Overlay to make it clear the monitor changed
  });

  ipcMain.on('set-overlay-position', (event, pos) => {
    state.overlayPosition = pos;
    pushState();
  });

  ipcMain.on('stop-editing-overlay', () => {
    state.overlayPosition.editing = false;
    pushState();
  });

  ipcMain.on('set-mechanics', (event, mechanics) => {
    state.knownMechanics = mechanics;
    pushState();
  });

  globalShortcut.register('CommandOrControl+Alt+S', () => {
    if (!selectorWindow) return;
    if (selectorWindow.isFocused()) {
      selectorWindow.blur();
      return;
    }
    if (selectorWindow.isMinimized()) {
      selectorWindow.restore();
    }
    selectorWindow.focus();
    pendingFocus = true;
  });

  globalShortcut.register('CommandOrControl+Alt+D', () => {
    if (!overlayWindow || state.instance === null) return;
    state.encounter = Math.min(state.encounter + 1, state.instance.encounters.length - 1);
    pushState();
  });
  globalShortcut.register('CommandOrControl+Alt+A', () => {
    if (!overlayWindow || state.instance === null) return;
    state.encounter = Math.max(0, state.encounter - 1);
    pushState();
  });

  const menuTemplate: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] as Electron.MenuItemConstructorOptions[] : []),
    {
      label: 'File',
      submenu: [
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Open Dev Tools', click: () => {
            selectorWindow.webContents.openDevTools({ mode: 'detach' });
          }
        },
        {
          label: 'Open Overlay Dev Tools', click: () => {
            overlayWindow.webContents.openDevTools({ mode: 'detach' });
          }
        },
        {
          type: 'separator',
        },
        {
          label: 'Contribute',
          click: () => {
            shell.openExternal('https://github.com/gwkunze');
          },
        }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  await createOverlayWindow(state.monitor);
  await createSelectorWindow(null);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    const state = loadState();
    createOverlayWindow(state.monitor);
    createSelectorWindow(null);
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
