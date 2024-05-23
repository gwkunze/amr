interface Mechanic {
    caption: string;
    description: string;
    group?: string; // TODO: For grouping similar mechanics?
    image?: string; // TODO: Image (url) to display when displaying description
}

export const Mechanics: { [k: string]: Mechanic } = {
    tankBuster: {
        caption: 'Tank Busters',
        description: 'Red arrow and circle above your characters head',
    },
    proximity: {
        caption: 'Proximity AoE',
        description: 'Pulsing (usually) purple circle. The closer you are, the more damage you take',
    },
    lookAway: {
        caption: 'Look Away!',
        description: 'An eye icon appear on the enemy. Dodge attack by facing your character away',
    },
    stack: {
        caption: 'Stack Markers',
        description: '5 Yellow chevrons pointing towards player (1 down, 4 cardinal), damage is divided between everyone nearby, bunch up to share the load'
    },
    multiStack: {
        caption: 'Multi-Stack Markers',
        description: 'Basically, Akh Morn. Same as stack markers except it\'s a series of attacks, so don\'t walk away after the first damage. Looks similar to stack marker but more arrows',
    },
    knockback: {
        caption: 'Knockback',
        description: 'Multiple yellow double-chevrons pointing in the same direction or away from a point appear on the ground. Once the attack happens, all players get moved in that direction unless using an ability that prevents movement',
    },
    soakTower: {
        caption: 'Soak Tower',
        description: 'A ground circle appears where at least 1 player must stand in it to take the damage, or entire party/raid will take damage. Usually contains a tower in the middle, but variations without a tower in the middle exist',
    }
};

export type Role = 'dps' | 'healer' | 'tank' | 'melee-dps' | 'physical-ranged-dps' | 'magical-ranged-dps';

export interface Job {
    name: string;
    role: Role;
}

export const Jobs: Job[] = [
    { 'name': 'Gladiator', 'role': 'tank' },
    { 'name': 'Paladin', 'role': 'tank' },
    { 'name': 'Marauder', 'role': 'tank' },
    { 'name': 'Warrior', 'role': 'tank' },
    { 'name': 'Dark Knight', 'role': 'tank' },
    { 'name': 'Gunbreaker', 'role': 'tank' },

    { 'name': 'Conjurer', 'role': 'healer' },
    { 'name': 'White Mage', 'role': 'healer' },
    { 'name': 'Astrologian', 'role': 'healer' },
    { 'name': 'Scholar', 'role': 'healer' },
    { 'name': 'Sage', 'role': 'healer' },

    { 'name': 'Lancer', 'role': 'melee-dps' },
    { 'name': 'Dragoon', 'role': 'melee-dps' },
    { 'name': 'Pugilist', 'role': 'melee-dps' },
    { 'name': 'Monk', 'role': 'melee-dps' },
    { 'name': 'Rogue', 'role': 'melee-dps' },
    { 'name': 'Ninja', 'role': 'melee-dps' },
    { 'name': 'Samurai', 'role': 'melee-dps' },
    { 'name': 'Reaper', 'role': 'melee-dps' },
    // { 'name': 'Viper', 'role': 'melee-dps' },

    { 'name': 'Archer', 'role': 'physical-ranged-dps' },
    { 'name': 'Bard', 'role': 'physical-ranged-dps' },
    { 'name': 'Machinist', 'role': 'physical-ranged-dps' },
    { 'name': 'Dancer', 'role': 'physical-ranged-dps' },

    { 'name': 'Thaumaturge', 'role': 'magical-ranged-dps' },
    { 'name': 'Black Mage', 'role': 'magical-ranged-dps' },
    { 'name': 'Arcanist', 'role': 'magical-ranged-dps' },
    { 'name': 'Summoner', 'role': 'magical-ranged-dps' },
    { 'name': 'Red Mage', 'role': 'magical-ranged-dps' },
    { 'name': 'Blue Mage', 'role': 'magical-ranged-dps' },
    // { 'name': 'Pictomancer', 'role': 'magical-ranged-dps' },
    // {'name': 'Beastmaster', 'role': '????'},
];

interface Context {
    job: Job;
    mechanics: Set<string>;
}

export abstract class Limit {
    abstract match(ctx: Context): boolean;
}

export class JobsLimit extends Limit {
    jobs: string[];
    invert: boolean;

    constructor(jobs: string[], invert: boolean) {
        super();
        this.jobs = jobs;
        this.invert = invert;
    }

    match(ctx: Context): boolean {
        for (const job of this.jobs) {
            if (job === ctx.job.name) {
                return !this.invert;
            }
        }
        return this.invert;
    }
}

export class RolesLimit extends Limit {
    roles: Role[];
    invert: boolean;

    constructor(roles: Role[], invert: boolean) {
        super();
        this.roles = roles;
        this.invert = invert;
    }

    match(ctx: Context): boolean {
        for (const role of this.roles) {
            if (role === ctx.job.role) {
                return !this.invert;
            }
            const dpsRoles = ['melee-dps', 'magical-ranged-dps', 'physical-ranged-dps'];
            if (role === 'dps' && dpsRoles.indexOf(ctx.job.role) >= 0) {
                return !this.invert;
            }
        }
        return this.invert;
    }
}

export class MechanicLimit extends Limit {
    mechanic: string

    constructor(mechanic: string) {
        super();
        this.mechanic = mechanic;
    }

    match(ctx: Context): boolean {
        return !ctx.mechanics.has(this.mechanic);
    }
}

export abstract class Step {
    abstract shouldBeShown(ctx: Context): boolean;
}

export class TextStep extends Step {
    text: string
    limits: Limit[];

    constructor(text: string, limits: Limit[]) {
        super();
        this.text = text;
        this.limits = limits || [];
    }

    shouldBeShown(ctx: Context): boolean {
        if (this.limits.length === 0) {
            // No limits defined, show step
            return true;
        }
        for (const limit of this.limits) {
            if (limit.match(ctx)) {
                return true
            }
        }
        // No limit matches, don't show step
        return false;
    }
}

export class ProximityStep extends Step {
    proximity: boolean

    constructor() {
        super();
        this.proximity = true;
    }

    shouldBeShown(ctx: Context): boolean {
        return !ctx.mechanics.has('proximity');
    }
}

export class TankBusterStep extends Step {
    tankBuster: boolean
    constructor() {
        super();
        this.tankBuster = true;
    }

    shouldBeShown(ctx: Context): boolean {
        return !ctx.mechanics.has('tankBuster');
    }
}

export class StackStep extends Step {
    stack: boolean
    constructor() {
        super();
        this.stack = true;
    }

    shouldBeShown(ctx: Context): boolean {
        return !ctx.mechanics.has('stack');
    }
}

export class KnockbackStep extends Step {
    knockback: boolean
    constructor() {
        super();
        this.knockback = true;
    }

    shouldBeShown(ctx: Context): boolean {
        return !ctx.mechanics.has('knockback');
    }
}

export class Encounter {
    name: string
    steps: Step[];

    constructor(name: string, steps: Step[]) {
        this.name = name;
        this.steps = steps || [];
    }
}

export class Instance {
    name: string;
    alternateNames: string[];
    encounters: Encounter[];

    constructor(name: string, alternateNames: string[], encounters: Encounter[]) {
        this.name = name;
        this.alternateNames = alternateNames || [];
        this.encounters = encounters || [];
    }

    getFilteredSteps(encounter: number, ctx: Context): Step[] {
        const enc = this.encounters[encounter];
        return enc.steps.filter((step: Step) => {
            return step.shouldBeShown(ctx);
        });
    }
}

export function loadInstance(data: object): Instance {
    if (typeof data !== 'object') {
        throw `Invalid data passed to loadInstance, expected 'object' got '${typeof data}'`;
    }
    const encounters: Encounter[] = [];

    const parseLimits = (limits: object[]): Limit[] => {
        if (!limits || limits.length == undefined) return [];

        const result: Limit[] = [];

        for (const limit of limits) {
            if ('role' in limit) {
                result.push(new RolesLimit([limit.role as Role], ('invert' in limit) ? limit.invert as boolean : false));
            } else if ('roles' in limit) {
                result.push(new RolesLimit(limit['roles'] as Role[], ('invert' in limit) ? limit.invert as boolean : false));
            } else if ('jobs' in limit) {
                result.push(new JobsLimit(limit['jobs'] as string[], ('invert' in limit) ? limit.invert as boolean : false));
            } else if ('mechanic' in limit) {
                result.push(new MechanicLimit(limit['mechanic'] as string));
            }
        }

        return result;
    }

    if ('encounters' in data && Array.isArray(data.encounters)) {
        for (const enc of data.encounters ?? []) {
            const steps: Step[] = [];
            for (const step of enc.steps ?? []) {
                let newStep: Step = null;
                if ('text' in step && typeof step.text === 'string') {
                    newStep = new TextStep(step.text || '', parseLimits(step['limits'] || []));
                } else if (Object.hasOwn(step, 'proximity')) {
                    newStep = new ProximityStep();
                } else if (Object.hasOwn(step, 'tankBuster')) {
                    newStep = new TankBusterStep();
                } else if (Object.hasOwn(step, 'stack')) {
                    newStep = new StackStep();
                } else if (Object.hasOwn(step, 'knockback')) {
                    newStep = new KnockbackStep();
                }
                steps.push(newStep);
            }
            encounters.push(new Encounter(enc.name, steps));
        }
    }

    if (!('name' in data)) {
        throw `Name not set for instance passed into loadInstance`;
    }
    let alternateNames: string[] = [];
    if ('alternateNames' in data) {
        alternateNames = data['alternateNames'] as string[];
    }
    return new Instance(data['name'] as string, alternateNames, encounters);
}
