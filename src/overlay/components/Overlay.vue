<script setup>
import { computed, ref } from 'vue';
import EncounterStep from './EncounterStep.vue';
import { loadInstance } from '../../game';

const overlayPositionStyle = ref({
    top: "15%",
    left: "65%",
    fontSize: "1em",
});
const state = ref({});
const instance = ref(null);
const encounter = ref(0);

const currentEncounter = computed(() => {
    return instance.value?.encounters[encounter.value] || null;
});

function getContext() {
    return {
        job: state.value.job || { 'name': 'unknown', 'role': 'unknown' },
        mechanics: new Set(state.value.knownMechanics),
    }
}

const currentEncounterSteps = computed(() => {
    if (instance.value === null) {
        return [];
    }
    return instance.value.getFilteredSteps(state.value.encounter, getContext());
});

const updateFromState = (s) => {
    instance.value = loadInstance(s.instance);
    encounter.value = s.encounter;
    state.value = s;

    overlayPositionStyle.value.top = `${s.overlayPosition.top}%`;
    overlayPositionStyle.value.left = `${s.overlayPosition.left}%`;
    overlayPositionStyle.value.width = `${s.overlayPosition.width}%`;
    if (s.overlayPosition.editing) {
        overlayPositionStyle.value.backgroundColor = "rgba(255,255,255,0.3)";
    } else {
        overlayPositionStyle.value.backgroundColor = "rgba(255,255,255,0.0)";
    }
};

AMemoryReborn.getState().then(updateFromState);
AMemoryReborn.onUpdateState(updateFromState);
</script>

<template>
    <div class="overlay-window" :style="overlayPositionStyle">
        <template v-if="instance != null">
            <h1>{{ instance.name }} <span v-if="instance.encounters[encounter]">- {{
                instance.encounters[encounter]?.name
                    }}</span></h1>
            <ul v-if="currentEncounter">
                <EncounterStep v-for="(step, index) in currentEncounterSteps || []" :step="step" :state="state"
                    :key="`item${index}`" />
                <li v-if="currentEncounterSteps.length == 0">No special instructions</li>
            </ul>
            <h2 class="previousEncounter" v-if="encounter > 0">🡠 {{ instance.encounters[encounter - 1].name }}</h2>
            <h2 class="nextEncounter" v-if="encounter < (instance.encounters.length - 1)">{{
                instance.encounters[encounter
                    + 1].name }} 🡢</h2>
        </template>
        <h1 v-else>No instance selected (Press Ctrl-Alt-S)</h1>
    </div>
</template>

<style scoped>
@counter-style thiccarrow {
    system: cyclic;
    symbols: "➤";
    suffix: " ";
}

.overlay-window {
    position: absolute;
    top: 15%;
    left: 65%;
    color: #e9efff;
    width: 20%;
    text-shadow: 0px 0px 2px #d8e8ff, 0px 0px 3px #607ba0, 0px 0px 4px #000, 0px 0px 4px #000, 0px 0px 4px #000, 0px 0px 4px #000;
    transition: background-color 0.2s;
}

h1,
h2 {
    color: rgb(245, 245, 230);
    text-shadow: 0px 0px 2px #efeb7e, 0px 0px 3px #69660e, 0px 0px 4px #000, 0px 0px 4px #000, 0px 0px 4px #000;
    font-weight: normal;
    margin: 0;
}

h1 {
    font-size: 1.3em;

}

h2 {
    font-size: 1.1em;
}

ul {
    margin-top: 0.3em;
    list-style: thiccarrow inside;
    padding: .2em 0 0 0;
    line-height: 1.4em;
}

.previousEncounter {
    float: left;
}

.nextEncounter {
    float: right;
}
</style>
