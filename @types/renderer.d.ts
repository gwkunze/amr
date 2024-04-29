declare const AMemoryReborn: {
    windowPurpose: string;

    onFocusFilter: (callback: () => void) => void;
    onUpdateState: (callback: (state: State) => void) => void;

    getInstances: () => Promise<Instance[]>;
    getMonitors: () => Promise<object[]>;
    getState: () => Promise<State>;

    setInstance: (instance: Instance, blur: boolean) => void;
    setEncounter: (encounter: number) => void;
    setJob: (job: Job) => void;
    setMonitor: (index: number) => void;
    setOverlayPosition: (pos: OverlayPosition) => void;
    stopEditingOverlay: () => void;
    setMechanics: (mechanics: string[]) => void;
}
