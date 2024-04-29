<script setup>
const props = defineProps({
    state: Object
});
</script>

<template>
    <li v-if="state.job?.role === 'tank'">
        Use mitigation when targeted with a Tank Buster (red circle and arrow above your head)
    </li>
    <li v-else>
        Don't stand near the tank when they're targeted by a Tank Buster (red circle and arrow above your head)
    </li>
</template>
