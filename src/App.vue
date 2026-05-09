<script setup>
import AppContainer from "@/AppContainer.vue";
import {useRoute, useRouter} from "vue-router";
import {watch} from "vue";
import {CUSTOM_THEME} from "@/themes/theme.js";

const router = useRouter();
const route = useRoute();

watch(
    () => route?.query?.token,
    () => {
      const newQuery = {...route.query};
      if (!newQuery.token) return;
      delete newQuery.token;
      router.replace({query: newQuery});
    },
    {immediate: true}
);
</script>

<template>
  <n-loading-bar-provider>
    <n-dialog-provider>
      <n-message-provider>
        <n-config-provider :theme-overrides="CUSTOM_THEME">
          <AppContainer/>
        </n-config-provider>
      </n-message-provider>
    </n-dialog-provider>
  </n-loading-bar-provider>
</template>
