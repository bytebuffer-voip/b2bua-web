<script setup>
import DesktopLayout from './DesktopLayout.vue'
import {NNotificationProvider} from 'naive-ui'
</script>

<template>
  <DesktopLayout>
    <n-notification-provider>
      <router-view/>
    </n-notification-provider>
  </DesktopLayout>
</template>
