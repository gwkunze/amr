<script setup>
import { computed } from 'vue';

const props = defineProps({
    instance: Object,
    selected: Boolean,
    state: Object,
});

const current = computed(() => {
    return props.state.instance?.name == props.instance?.name;
});

function selectEncounter(index) {
    AMemoryReborn.setEncounter(index);
}

</script>

<template>
    <div :class="{ selected: props.selected, current: current }">
        <h2>{{ props.instance.name }}</h2>
        <span class="encounter" v-if="current">
            <template v-for="(enc, index) in instance.encounters">
                <span v-tooltip.bottom="enc.name" @click.stop="() => { }" v-if="index == state.encounter">⬤</span>
                <span v-tooltip.bottom="enc.name" @click.stop="() => selectEncounter(index)" v-else>◯</span>
            </template>
        </span>
    </div>

</template>

<style scoped>
.selected {
    background-color: rgb(84, 9, 135);
}

.current {
    outline: 1px dashed rgb(147, 15, 234);
}

h2 {
    font-size: 1rem;
    font-weight: normal;
    padding-left: 0.2rem;
    margin: 0.3rem;
}

span.encounter {
    display: block;
    text-align: center;
}
</style>
