<script setup>

import {computed, onMounted, onUnmounted, ref} from "vue";
import {SOFTPHONE_STATUS} from "@/const/CallConst.js";

const props = defineProps({
  status: {
    type: String,
    default: SOFTPHONE_STATUS.TRYING,
  }
});

const threeDots = ref(1);
const threeDotsText = computed(() => {
  return '.'.repeat(threeDots.value);
});
let intervalId = null;

onMounted(() => {
  startRinging();
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
})

const startRinging = () => {
  intervalId = setInterval(() => {
    if (threeDots.value >= 3) {
      threeDots.value = 1;
    } else {
      threeDots.value++;
    }
  }, 1000);
};

</script>

<template>
  <span v-if="props.status === SOFTPHONE_STATUS.TRYING" class="ringing-trying">Đang kết nối {{threeDotsText}}</span>
  <span v-else class="ringing-out">Đang đổ chuông {{threeDotsText}}</span>
</template>

<style scoped>
  .ringing-out{
    display: inline-block;
    width: 132px;
    text-align: left;
  }

  .ringing-trying{
    display: inline-block;
    width: 110px;
    text-align: left;
  }
</style>