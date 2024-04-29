<script setup>
import { computed } from 'vue';

import TextStep from './steps/TextStep.vue';
import ProximityStep from './steps/ProximityStep.vue';
import TankBusterStep from './steps/TankBusterStep.vue';
import StackStep from './steps/StackStep.vue';

const props = defineProps({
    step: Object,
    state: Object,
});

const stepComponent = computed(() => {
    if (props.step.text) {
        return TextStep;
    }
    if (props.step.proximity) {
        return ProximityStep;
    }
    if (props.step.tankBuster) {
        return TankBusterStep;
    }
    if (props.step.stack) {
        return StackStep;
    }
    return null;
});

</script>

<template>
    <component v-if="stepComponent" :is="stepComponent" :step="props.step" :state="state" />
</template>
