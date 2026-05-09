<script setup>

import CountTime from "@/components/softphone/CountTime.vue";
import {computed, inject, onMounted, onUnmounted, ref} from "vue";
import {SOFTPHONE_EVENTS, SOFTPHONE_STATUS} from "@/const/CallConst.js";

const emit = defineEmits(['showFullSoftphone']);
const softphone = inject("softphone");
const label = ref("Rảnh");

const genLabel = (newStatus) => {
  if (newStatus === SOFTPHONE_STATUS.RINGING) {
    label.value = "Đang đổ chuông";
    return;
  }

  if (newStatus === SOFTPHONE_STATUS.ANSWERED) {
    label.value = "Đang trong cuộc gọi";
    return;
  }

  label.value = "Rảnh";
}

const handleSoftphoneStatusChange = (newStatus) => {
  genLabel(newStatus)
};

onMounted(() => {
  genLabel(softphone.getStatus());
  softphone.on(SOFTPHONE_EVENTS.CHANGE_STATUS, handleSoftphoneStatusChange);
});

onUnmounted(() => {
  softphone.off(SOFTPHONE_EVENTS.CHANGE_STATUS, handleSoftphoneStatusChange);
});

const showFull = () => {
  emit('showFullSoftphone');
}
</script>

<template>
  <div style="cursor: pointer" @click="showFull">
    {{label}}: <CountTime :initial-seconds="12"/>
  </div>
</template>

<style scoped>

</style>