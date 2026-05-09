<script setup>
import {useAuthStore} from "@/stores/store.js";
import {LogOutOutline} from "@vicons/ionicons5";
import accountService from "@/services/AccountService.js";

const authStore = useAuthStore();

const handleLogout = () => {
  accountService.logout().then(() => {
    authStore.unsetUserOnLogOut();
    window.location.href = '/login';
  }).catch(() => {
    authStore.unsetUserOnLogOut();
    window.location.href = '/login';
  });
}
</script>

<template>
  <n-popover trigger="click" placement="bottom-end">
    <template #trigger>
      <n-avatar round :size="32" style="cursor: pointer;">
        <span>{{ authStore.user?.display_name?.charAt(0)?.toUpperCase() || 'U' }}</span>
      </n-avatar>
    </template>
    <div style="min-width: 200px;">
      <div style="padding: 10px 0; border-bottom: 1px solid var(--color-border);">
        <p style="font-weight: 600;">{{ authStore.user?.display_name || authStore.user?.email }}</p>
        <p class="text-muted" style="font-size: 12px;">{{ authStore.user?.email }}</p>
      </div>
      <n-button @click="handleLogout" text block style="justify-content: start; padding: 10px 0;">
        <n-icon style="margin-right: 8px;"><LogOutOutline/></n-icon>
        Đăng xuất
      </n-button>
    </div>
  </n-popover>
</template>
