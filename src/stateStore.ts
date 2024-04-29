import Store from 'electron-store';
import { State, OverlayPosition } from './state';
import { Instance, Jobs, loadInstance } from './game';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'yaml';


const store = new Store();
const allInstances: Instance[] = [];
const instancesByName: Map<string, number> = new Map();

const currentState: State = {
    instance: null,
    encounter: 0,
    monitor: 0,
    job: null,
    overlayPosition: {
        left: 65,
        top: 15,
        width: 20,
        editing: false,
    },
    knownMechanics: [],
}

export function loadState(): State {
    currentState.instance = allInstances[instancesByName.get(store.get('instance', null) as string)] || null;
    currentState.encounter = store.get('encounter', 0) as number;
    currentState.monitor = store.get('monitor', 0) as number;

    const jobName = store.get('job') as string;
    for (const job of Jobs) {
        if (job.name == jobName) {
            currentState.job = job;
            break;
        }
    }
    currentState.overlayPosition = store.get('overlayPosition', { left: 65, top: 15, width: 20, editing: false }) as OverlayPosition;
    currentState.knownMechanics = store.get('knownMechanics', []) as string[];

    return currentState;
}

export function saveState() {
    if (currentState.instance === null) {
        store.delete('instance');
    } else {
        store.set('instance', currentState.instance.name);
    }
    store.set('encounter', currentState.encounter);
    store.set('monitor', currentState.monitor);
    if (currentState.job === null) {
        store.delete('job');
    } else {
        store.set('job', currentState.job?.name);
    }
    store.set('overlayPosition', currentState.overlayPosition);
    store.set('knownMechanics', currentState.knownMechanics);
}

export async function loadInstances(): Promise<void> {
    let instancePath = path.join(process.resourcesPath, 'instances/**/*.yaml');
    if (process.env.NODE_ENV === 'development') {
        instancePath = 'instances/**/*.yaml';
    }
    const files = await glob(instancePath, { windowsPathsNoEscape: true });

    allInstances.length = 0;

    for (const path of files) {
        const fileContents = await fs.readFile(path, { encoding: 'utf-8' });
        const contents = parse(fileContents);

        allInstances.push(loadInstance(contents));
    }

    allInstances.sort((a, b) => {
        if (a.name > b.name) {
            return 1;
        } else if (a.name < b.name) {
            return -1;
        }
        return 0;
    });

    instancesByName.clear();
    for (let i = 0; i < allInstances.length; i++) {
        instancesByName.set(allInstances[i].name, i);
    }
}

export function getInstances(): Instance[] {
    return allInstances;
}

export function getInstance(name: string): Instance {
    return allInstances[instancesByName.get(name)] || null;
}
