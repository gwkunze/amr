import { contextBridge, ipcRenderer } from 'electron';

import { Instance, Job } from './game';
import { OverlayPosition, State } from "./state";

contextBridge.exposeInMainWorld('AMemoryReborn', {
    windowPurpose: process.argv[process.argv.length - 1],
    onFocusFilter: (callback: () => void) => ipcRenderer.on('focus-filter', () => callback()),
    onUpdateState: (callback: (state: State) => void) => ipcRenderer.on('update-state', (_event, state) => callback(state)),

    getInstances: async (): Promise<Instance[]> => ipcRenderer.invoke('get-instances'),
    getMonitors: async (): Promise<object[]> => ipcRenderer.invoke('get-monitors'),
    getState: (): Promise<State> => ipcRenderer.invoke('get-state'),

    setInstance: (instance: Instance, blur: boolean) => ipcRenderer.send('set-instance', { instance, blur }),
    setEncounter: (encounter: number) => ipcRenderer.send('set-encounter', encounter),
    setJob: (job: Job) => ipcRenderer.send('set-job', job),
    setMonitor: (index: number) => ipcRenderer.send('set-monitor', index),
    setOverlayPosition: (pos: OverlayPosition) => ipcRenderer.send('set-overlay-position', pos),
    stopEditingOverlay: () => ipcRenderer.send('stop-editing-overlay'),
    setMechanics: (mechanics: string[]) => ipcRenderer.send('set-mechanics', mechanics),
});

