<script setup>
import TopBar from "@/layouts/components/Desktop/TopBar.vue";
</script>

<template>
  <div id="desktop-layout">
    <n-layout>
      <div class="main-content">
        <TopBar/>
        <slot />
      </div>
    </n-layout>
  </div>
</template>

<style lang="scss">
#desktop-layout{
  .main-content{
    height: 100vh;
    overflow: auto;
    background: var(--background-main-light);
    display: flex;
    flex-direction: column;
  }
}
</style>
