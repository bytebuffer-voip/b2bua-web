<script setup>
import {useAppStore} from "@/stores/store.js";
import AccountButton from "@/components/AccountButton.vue";

const appStore = useAppStore();
</script>

<template>
  <div class="top-bar">
    <p class="title">{{appStore.pageTitle}}</p>
    <AccountButton/>
  </div>
</template>

<style scoped>
.top-bar{
  display: flex;
  gap: 15px;
  padding: 10px 15px;
  justify-content: end;
  border-bottom: 1px solid var(--color-border);
  align-items: center;
  position: relative;
  background: var(--color-background);

  .title{
    position: absolute;
    left: 15px;
    top: 50%;
    transform: translateY(-50%);
    margin: 0;
    font-size: 20px;
    font-weight: 500;
  }
}
</style>
