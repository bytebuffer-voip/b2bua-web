<script setup>
import {useLoadingBar} from "naive-ui";
import {onBeforeMount, provide, ref} from "vue";
import {NNotificationProvider} from 'naive-ui'

const loadingBar = useLoadingBar();
const loadingBarIsActive = ref(false);

onBeforeMount(() => {
  startLoading();
})

const startLoading = () => {
  if (loadingBarIsActive.value) return;
  loadingBarIsActive.value = true;
  loadingBar.start()
}

const finishLoading = () => {
  if (!loadingBarIsActive.value) return;
  loadingBarIsActive.value = false;
  loadingBar.finish()
}

const errorLoading = () => {
  if (!loadingBarIsActive.value) return;
  loadingBarIsActive.value = false;
  loadingBar.error()
}

provide('startLoading', startLoading);
provide('finishLoading', finishLoading);
provide('errorLoading', errorLoading);
</script>

<template>
  <n-notification-provider>
    <router-view />
  </n-notification-provider>
</template>

<style lang="scss">
.n-loading-bar-container .n-loading-bar.n-loading-bar--starting {
  background: var(--color-primary-light-3);
  height: 4px;
}
</style>
