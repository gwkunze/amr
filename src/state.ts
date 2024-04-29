import { Instance, Job } from "./game";

export interface OverlayPosition {
    left: number;
    top: number;
    width: number;
    editing: boolean;
}

export interface State {
    instance: Instance;
    encounter: number;
    monitor: number;
    job: Job;
    overlayPosition: OverlayPosition;
    knownMechanics: string[];
}
