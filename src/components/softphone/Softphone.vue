<script setup>

import {inject, onMounted, onUnmounted, ref} from "vue";
import {AppsOutline, TimeOutline, PeopleOutline} from "@vicons/ionicons5";
import DialTab from "@/components/softphone/DialTab.vue";
import Calling from "@/components/softphone/Calling.vue";
import {SOFTPHONE_EVENTS, SOFTPHONE_NOTIFICATION_TYPES, SOFTPHONE_STATUS} from "@/const/CallConst.js";
import Ringing from "@/components/softphone/Ringing.vue";
import {useMessage} from "naive-ui";


const message = useMessage();
const softphone = inject("softphone");
const tabActive = ref('dial');
const softphoneStatus = ref(SOFTPHONE_STATUS.IDLE);
const endCallAudio = ref(null);
const micMuted = ref(false);
const soundMuted = ref(false);
const holdCall = ref(false);

onMounted(() => {
  softphoneStatus.value = softphone.getStatus();
  micMuted.value = softphone.getMicMuted();
  soundMuted.value = softphone.getSoundMuted();

  softphone.on(SOFTPHONE_EVENTS.CHANGE_STATUS, handleSoftphoneStatusChange);
  softphone.on(SOFTPHONE_EVENTS.PLAY_END_SOUND, handlePlayEndCallAudio);
  softphone.on(SOFTPHONE_EVENTS.MUTE_MIC_STATUS_CHANGED, handleMuteMicrophone);
  softphone.on(SOFTPHONE_EVENTS.MUTE_SOUND_STATUS_CHANGED, handleMuteSound);
  softphone.on(SOFTPHONE_EVENTS.HOLD_STATUS_CHANGED, handleHoldCallStatus);
  softphone.on(SOFTPHONE_EVENTS.NEW_NOTIFICATION, handleSoftphoneNotification);
})

onUnmounted(() => {
  softphone.off(SOFTPHONE_EVENTS.CHANGE_STATUS, handleSoftphoneStatusChange);
  softphone.off(SOFTPHONE_EVENTS.PLAY_END_SOUND, handlePlayEndCallAudio);
  softphone.off(SOFTPHONE_EVENTS.MUTE_MIC_STATUS_CHANGED, handleMuteMicrophone);
  softphone.off(SOFTPHONE_EVENTS.MUTE_SOUND_STATUS_CHANGED, handleMuteSound);
  softphone.off(SOFTPHONE_EVENTS.HOLD_STATUS_CHANGED, handleHoldCallStatus);
  softphone.off(SOFTPHONE_EVENTS.NEW_NOTIFICATION, handleSoftphoneNotification);
})

const handleSoftphoneNotification = (data) => {
  if (data?.type === SOFTPHONE_NOTIFICATION_TYPES.ERROR) {
    message.error(data?.message || "Đã có lỗi xảy ra");
  }
}

const handleHoldCallStatus = (onHold) => { holdCall.value = onHold; }
const handleMuteSound = (muted) => { soundMuted.value = muted; }
const handleMuteMicrophone = (muted) => { micMuted.value = muted; }

const handlePlayEndCallAudio = () => {
  if (endCallAudio.value) {
    endCallAudio.value.play().catch((e) => console.error('Failed to play end call audio:', e));
  }
};

const handleSoftphoneStatusChange = (newStatus) => {
  softphoneStatus.value = newStatus;
  if (newStatus === SOFTPHONE_STATUS.RINGING ||
      newStatus === SOFTPHONE_STATUS.TRYING ||
      newStatus === SOFTPHONE_STATUS.ANSWERED) {
    tabActive.value = 'dial';
  }
};
</script>

<template>
  <div class="softphone-body">
    <div class="sp-content">
      <Calling v-if="
        softphoneStatus === SOFTPHONE_STATUS.ANSWERED
        || softphoneStatus === SOFTPHONE_STATUS.TRYING
        || softphoneStatus === SOFTPHONE_STATUS.RINGING_OUT"
      />
      <Ringing v-else-if="softphoneStatus === SOFTPHONE_STATUS.RINGING" />
      <DialTab v-else/>
    </div>

    <div class="sp-tab-bar">
      <n-button text class="sp-tab-btn active">
        <n-icon :size="22"><AppsOutline/></n-icon>
        <span class="sp-tab-label">Quay số</span>
      </n-button>
      <n-button disabled text class="sp-tab-btn">
        <n-icon :size="22"><TimeOutline/></n-icon>
        <span class="sp-tab-label">Lịch sử</span>
      </n-button>
      <n-button disabled text class="sp-tab-btn">
        <n-icon :size="22"><PeopleOutline/></n-icon>
        <span class="sp-tab-label">Liên hệ</span>
      </n-button>
    </div>

    <audio ref="endCallAudio" style="display:none;">
      <source src="/media/end_call.mp3" type="audio/ogg">
    </audio>
  </div>
</template>

<style scoped>
.softphone-body {
  width: 100%;
}

.sp-content {
  width: 100%;
  height: 430px;
}

.sp-tab-bar {
  display: flex;
  margin-top: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
}

.sp-tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 0;
  border-radius: 9px;
  color: #94a3b8;
  transition: all 0.15s ease;
  height: auto;

  &.active {
    color: var(--color-primary);
    background: #fff;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
  }

  &:hover:not(:disabled):not(.active) {
    color: #475569;
  }
}

.sp-tab-label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}
</style>

<style lang="scss">
.softphone-body {
  .sp-tab-btn .n-button__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }

  .btn-keyboard .n-button__content {
    display: inline-block;
  }
}
</style>
