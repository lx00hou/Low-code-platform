<template>
    <div id="app">
       
        <editor v-model="state"/>
         <!-- 
            vue3 中 v-model 语法糖 等同于
            <editor :modelValue='state' @update:modelValue='xxx' />
         -->

    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import data from './data.json';
import editor from './packages/editor';
const state = ref(data);

</script>

<style lang="scss">
#app {
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    border: 1px solid red;
}
</style>
