<script setup>
import Dropdown from 'primevue/dropdown';
import FloatLabel from 'primevue/floatlabel';
import Checkbox from 'primevue/checkbox';
import Slider from 'primevue/slider';
import { ref, watch } from 'vue';
import Icons from './../../assets/icons';
import { Jobs, Mechanics } from '../../game';

const props = defineProps({
    state: Object,
    allMonitors: Array,
});

const emit = defineEmits(['jobSelected', 'monitorSelected', 'stopEditingOverlay', 'overlayChanged', 'mechanicsChanged']);

const selectedJob = ref(props.state.job);
const selectedMonitor = ref(null);
const knownMechanics = ref([]);
const allJobs = ref(Jobs);
const horizonalPos = ref(0);
const verticalPos = ref(0);
const width = ref(0);

let initialSetup = true;

watch(() => [props.state, props.allMonitors], ([newState, monitors]) => {
    if (!newState || !monitors) {
        return;
    }
    for (let job of Jobs) {
        if (newState.job && job.name == newState.job.name) {
            selectedJob.value = job;
            break;
        }
    }
    selectedMonitor.value = monitors[newState.monitor];
    if (!initialSetup)
        return;
    horizonalPos.value = newState.overlayPosition.left;
    verticalPos.value = newState.overlayPosition.top;
    width.value = newState.overlayPosition.width;
    knownMechanics.value = newState.knownMechanics;
    initialSetup = false;
});

watch(selectedJob, (newJob) => {
    if (newJob.name !== props.state.job?.name) {
        emit('jobSelected', newJob);
    }
});

watch(selectedMonitor, (newMonitor) => {
    const newIndex = props.allMonitors.indexOf(newMonitor);
    if (newIndex >= 0 && newIndex != props.state.monitor) {
        emit('monitorSelected', newIndex);
    }
});

watch(knownMechanics, (mechanics) => {
    emit('mechanicsChanged', mechanics);
});

let editTimeout = null;
watch([horizonalPos, verticalPos, width], ([h, v, w]) => {
    if (editTimeout !== null) {
        clearTimeout(editTimeout);
        editTimeout = null;
    }
    const currentPos = props.state.overlayPosition;
    if (h === currentPos.left && v == currentPos.top && w == currentPos.width) {
        return;
    }
    emit('overlayChanged', [h, v, w]);
    editTimeout = setTimeout(() => {
        emit('stopEditingOverlay');
    }, 1000);
});


</script>

<template>
    <div class="settings">
        <FloatLabel class="label-element">
            <Dropdown class="job-selector" v-model="selectedJob" inputId="jobSel" :options="allJobs" optionLabel="name">
                <template #value="slotProps">
                    <div v-if="slotProps.value" class="flex align-items-center">
                        <img class="job-icon" :src="Icons.Jobs.get(slotProps.value.name)" />
                        {{ slotProps.value.name }}
                    </div>
                </template>
                <template #option="slotProps">
                    <div class="flex align-items-center">
                        <img class="job-icon" :src="Icons.Jobs.get(slotProps.option?.name)">
                        {{ slotProps.option.name }}
                    </div>
                </template>
            </Dropdown>
            <label for="jobSel">Select your Job</label>
        </FloatLabel>
        <FloatLabel v-if="allMonitors != null && allMonitors.length > 1" class="label-element">
            <Dropdown class="monitor-selector" v-model="selectedMonitor" inputId="monitorSel" :options="allMonitors"
                optionLabel="label" />
            <label for="monitorSel">Select the overlay monitor</label>
        </FloatLabel>
        <div class="overlay-position">
            <label for="horizontalPos">Horizontal Position</label>
            <Slider v-model="horizonalPos" id="horizontalPos" />
            <label for="verticalPos">Vertical Position</label>
            <Slider v-model="verticalPos" id="verticalPos" />
            <label for="width">Width</label>
            <Slider v-model="width" id="width" :min="10" :max="40" />
        </div>
        <h3>Select mechanics you are familiar with, any instructions for these will be filtered out.</h3>
        <div class="mechanics">
            <div v-for="mechanic, key in Mechanics" v-tooltip.top="mechanic.description">
                <Checkbox v-model="knownMechanics" :inputId="key" name="mechanic" :value="key" />
                <label :for="key">{{ mechanic.caption }}</label>
            </div>
        </div>
        <div class="instructions">
            <h2>Instructions</h2>
            <ul>
                <li>Press Ctrl-Alt-S to focus on this window and start typing to filter the list.</li>
                <li>Make your choice with the up- and down-arrows and confirm with enter. The focus should go back to
                    the
                    game
                    automatically</li>
                <li>Switch between encounters with Ctrl-Alt-A (previous encounter) and Ctrl-Alt-D (next encounter)</li>
                <li>Stop displaying instructions by pressing Ctrl-Alt-X</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
div.settings {
    flex: 3;
    margin: .4rem;
    padding-left: .6rem;
    display: flex;
    flex-direction: column;
}

.label-element {
    margin-top: 0.6em;
}

.job-icon {
    width: 1.5em;
    vertical-align: middle;
}

.job-selector {
    width: 20em;
}

.monitor-selector {
    width: 20em;
}

.overlay-position {
    max-width: 400px;
}

.overlay-position label {
    margin-top: 1em;
    margin-bottom: 1em;
    display: block;
}

.instructions {
    margin: 1em;
}

.mechanics {
    margin-top: 1em;
    display: flex;
    flex-direction: row;
}

.mechanics>div {
    padding: .4em;
}

.mechanics>div>label {
    padding-left: .1em;
}
</style>
