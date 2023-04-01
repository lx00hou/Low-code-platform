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
import { provide, ref } from 'vue';
import data from './data.json';
import editor from './packages/editor';
import {registerConfig as config} from './utils/editConfig';   // 物料组件 以及 映射对象
const state = ref(data);
provide('config',config);

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
