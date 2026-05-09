<script setup>

import {inject, onMounted, onUnmounted, ref} from "vue";
import {formatTimeDuration} from "@/helper/dateTimeHelper.js";
import {SOFTPHONE_EVENTS} from "@/const/CallConst.js";

const props = defineProps({
  initialSeconds: {
    type: Number,
    default: 0
  }
})

const softphone = inject("softphone");
const seconds = ref(props.initialSeconds);
const ended = ref(false);

let intervalId = null;

onMounted(() => {
  startCounting();
  listenPlayEndCallAudio();
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  softphone.off(SOFTPHONE_EVENTS.PLAY_END_SOUND, handlePlayEndCallAudio)
})

const listenPlayEndCallAudio = () => {
  softphone.on(SOFTPHONE_EVENTS.PLAY_END_SOUND, handlePlayEndCallAudio)
};

const handlePlayEndCallAudio = () => {
  ended.value = true;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }

  setTimeout(() => {
    ended.value = false;
  }, 1500);
}

const startCounting = () => {
  if (intervalId) return; // Prevent multiple intervals
  intervalId = setInterval(() => {
    seconds.value++;
  }, 1000);
};

</script>

<template>
  <span :class="ended ? 'time-ended' : ''">{{formatTimeDuration(seconds)}}</span>
</template>

<style scoped>
.time-ended{
  color: red;
  font-weight: bold;
}
</style>