<script setup>
import { ref } from 'vue';
import InstanceSelector from './InstanceSelector.vue';
import Settings from './Settings.vue';

const instances = ref(null);
const state = ref({});
const instanceSelector = ref(null);
const allMonitors = ref([]);

AMemoryReborn.getInstances().then(i => {
    instances.value = i;
});

AMemoryReborn.getState().then(s => {
    state.value = s;
});

AMemoryReborn.getMonitors().then(m => {
    allMonitors.value = m;
});

AMemoryReborn.onFocusFilter(() => {
    instanceSelector.value.forceFocus();
});

AMemoryReborn.onUpdateState((s) => {
    state.value = s;
});

const cloneObj = (obj) => JSON.parse(JSON.stringify(obj));

function onInstanceSelected({ instance, blur }) {
    AMemoryReborn.setInstance(cloneObj(instance), blur);
}

function onJobSelected(job) {
    AMemoryReborn.setJob(cloneObj(job));
}

function onMonitorSelected(index) {
    AMemoryReborn.setMonitor(index);
}

function onOverlayChanged([left, top, width]) {
    AMemoryReborn.setOverlayPosition({
        left,
        top,
        width,
        editing: true,
    });
}

function onStopEditingOverlay() {
    AMemoryReborn.stopEditingOverlay();
}

function onMechanicsChanged(mechanics) {
    AMemoryReborn.setMechanics(cloneObj(mechanics));
}

</script>

<template>
    <section class="ui">
        <instanceSelector @instance-selected="onInstanceSelected" :instances="instances" :state="state"
            ref="instanceSelector" />
        <settings :state="state" :all-monitors="allMonitors" @job-selected="onJobSelected"
            @monitor-selected="onMonitorSelected" @overlay-changed="onOverlayChanged"
            @stop-editing-overlay="onStopEditingOverlay" @mechanics-changed="onMechanicsChanged" />
    </section>
</template>


<style>
section.ui {
    display: flex;
    flex-direction: row;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
}
</style>
