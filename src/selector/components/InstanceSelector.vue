<script setup>
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import Button from 'primevue/button';
import Instance from './Instance.vue';
import { ref, computed } from 'vue';

const props = defineProps({
    instances: Array,
    state: Object,
});

const emit = defineEmits(['instanceSelected']);

const pFilter = ref(null);
const selectedIndex = ref(0);
const instanceFilter = ref("");
const instanceItems = ref(null);

const filteredInstances = computed(() => {
    selectedIndex.value = 0;
    if (props.instances == null) {
        return [];
    }
    return props.instances.filter((instance) => {
        return [instance.name, ...instance.alternateNames].filter((name) => name.toLowerCase().includes(instanceFilter.value.toLowerCase())).length > 0;
    });
});

function scrollIfNeeded(align) {
    const target = instanceItems.value[selectedIndex.value];
    const rect = target.getBoundingClientRect();
    const parentRect = target.parentNode.getBoundingClientRect();

    if (rect.bottom > parentRect.bottom) {
        target.scrollIntoView(false)
    } else if (rect.top < parentRect.top) {
        target.scrollIntoView(true);
    }
}

function up() {
    selectedIndex.value--;
    if (selectedIndex.value < 0) {
        selectedIndex.value = filteredInstances.value.length - 1;
    }
    scrollIfNeeded(true);
}

function down() {
    selectedIndex.value = (selectedIndex.value + 1) % filteredInstances.value.length;
    scrollIfNeeded(false);
}

function enter() {
    emit('instanceSelected', {
        instance: filteredInstances.value[selectedIndex.value],
        blur: true,
    });
}

function selectInstance(instance, index) {
    selectedIndex.value = index;
    emit('instanceSelected', {
        instance,
        blur: false,
    });
};

const forceFocus = () => {
    instanceFilter.value = "";
    pFilter.value.$el.focus();
}

defineExpose({ forceFocus });

</script>

<template>
    <div class="instance-selector">
        <div class="top">
            <FloatLabel class="floatlabel">
                <InputText ref="pFilter" id="filter" type="text" v-model="instanceFilter" @keyup.up="up"
                    @keyup.down="down" @keyup.enter="enter" />
                <label for="filter">Select Instance</label>
            </FloatLabel>
            <Button label="Clear" @click="() => selectInstance(null, null)" />
        </div>
        <div class="instances">
            <div v-for="(instance, index) in filteredInstances" :key="instance.name" ref="instanceItems"
                @click="() => selectInstance(instance, index)">
                <Instance :instance="instance" :selected="index == selectedIndex" :state="state"></Instance>
            </div>
        </div>
    </div>
</template>

<style scoped>
div.instance-selector {
    flex: 1;
    padding: 1rem;
    border-right: 1px solid #555;
    display: flex;
    flex-direction: column;
}

div.instances {
    height: 100%;
    overflow: auto;
}

div.instances>div {
    cursor: pointer;
}

.top {
    margin-bottom: .7em;
    display: flex;
    flex-direction: row;
}

.top .floatlabel {
    flex: 1;
}
</style>

<style>
#filter {
    width: 100%;
}
</style>
