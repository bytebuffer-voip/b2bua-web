<script setup>
import {useAppStore} from "@/stores/store.js";
import {inject, onMounted, onUnmounted, ref} from "vue";
import Softphone from "@/components/softphone/Softphone.vue";
import SoftphoneMini from "@/components/softphone/SoftphoneMini.vue";
import SoftphoneCardHeader from "@/components/softphone/SoftphoneCardHeader.vue";
import {SOFTPHONE_EVENTS, SOFTPHONE_STATUS} from "@/const/CallConst.js";

const appStore = useAppStore();
const finishLoading = inject('finishLoading');
const softphone = inject("softphone");

const DISPLAY_MODES = { FULL: 'full', MINI: 'mini' };
const displayMode = ref(DISPLAY_MODES.FULL);


const handleChangeStatus = (newStatus) => {
  if (newStatus === SOFTPHONE_STATUS.IDLE) {
    setTimeout(() => { displayMode.value = DISPLAY_MODES.FULL; }, 300);
  }
};

const handleShowSoftphone = () => {
  displayMode.value = DISPLAY_MODES.FULL;
};


onMounted(() => {
  appStore.setPageTitle('B2BUA');
  finishLoading();

  if ("Notification" in window) {
    Notification.requestPermission();
  }

  softphone.on(SOFTPHONE_EVENTS.CHANGE_STATUS, handleChangeStatus);
  softphone.on(SOFTPHONE_EVENTS.SHOW_SOFTPHONE, handleShowSoftphone);
});

onUnmounted(() => {
  softphone.off(SOFTPHONE_EVENTS.CHANGE_STATUS, handleChangeStatus);
  softphone.off(SOFTPHONE_EVENTS.SHOW_SOFTPHONE, handleShowSoftphone);
});

const showFullSoftphone = () => {
  displayMode.value = DISPLAY_MODES.FULL;
};
</script>

<template>
  <div class="b2bua-page">
    <div class="b2bua-container">
      <div class="softphone-card">
        <SoftphoneCardHeader
          title="Softphone"
          subtitle="B2BUA Dialer"
          icon="phone_in_talk"
        />

        <div class="softphone-card-body">
          <Softphone v-show="displayMode === DISPLAY_MODES.FULL"/>
          <SoftphoneMini @showFullSoftphone="showFullSoftphone" v-show="displayMode === DISPLAY_MODES.MINI"/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.b2bua-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
}

.b2bua-container {
  width: 100%;
  max-width: 340px;
  padding-top: 20px;
}

.softphone-card {
  background: var(--color-background);
  border-radius: 20px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 10px 30px -5px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.softphone-card:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.07),
    0 14px 40px -5px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}

.softphone-card-header {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
}


.softphone-card-body {
  padding: 16px 20px 20px;
}

</style>
