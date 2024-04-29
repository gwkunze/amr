<script setup>
import { computed } from 'vue';
import Icons from '../../../assets/icons';
const props = defineProps({
    step: Object
});

const parts = computed(() => {
    const split = props.step.text.split(/\$\{(\w+):(.*?)\}/);
    const result = [];

    while (true) {
        result.push({
            'type': 'text',
            'text': split.shift(),
        });
        if (split.length == 0) break;
        const category = split.shift();
        const name = split.shift();

        if (Icons[category] === undefined) {
            alert(`Unknown icon category '${category}'`);
            continue;
        }
        if (Icons[category].get(name) === undefined) {
            alert(`Unknown icon '${name}' in category '${category}'`);
            continue;
        }

        result.push({
            'type': 'image',
            'class': 'icon',
            'url': Icons[category].get(name),
        });
    }
    return result;
});

</script>

<template>
    <li>
        <template v-for="part in parts">
            <template v-if="part.type == 'text'">{{ part.text }}</template>
            <img v-if="part.type == 'image'" :src="part.url" :class="part.class" />
        </template>
    </li>
</template>

<style scoped>
img.icon {
    width: 1.5em;
    vertical-align: middle;
}
</style>
