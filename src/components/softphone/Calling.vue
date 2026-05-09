<script setup>

import MIcon from "@/components/MIcon.vue";
import VietnamPhoneFormatter from "@/helper/VietnamPhoneFormatter.js";
import {computed, inject, onMounted, onUnmounted, ref} from "vue";
import CountTime from "@/components/softphone/CountTime.vue";
import {CALL_DIRECTION, SOFTPHONE_EVENTS, SOFTPHONE_STATUS} from "@/const/CallConst.js";
import {getFullName} from "@/helper/ContactHelper.js";
import {useRouter} from "vue-router";
import RingingOutText from "@/components/softphone/RingingOutText.vue";
import {Close} from "@vicons/ionicons5";
import {NButton, useMessage} from "naive-ui";
import TransferCallModal from "@/components/softphone/TransferCallModal.vue";
import InviteToCallModal from "@/components/softphone/InviteToCallModal.vue";
import AvatarContact from "@/components/AvatarContact.vue";

const message = useMessage();
const softphone = inject("softphone");
const remoteAudio = ref(null);
const contactPhoneNumber = ref(null);
const router = useRouter();
const phoneNumber = ref("");
const softphoneStatus = ref(null);
const micMuted = ref(false);
const soundMuted = ref(false);
const isShowTransferModal = ref(false);
const isShowInviteModal = ref(false);
const transferStatus = ref(false);
const inviteStatus = ref(false);
const agentsInCall = ref([]);
const lastTransferResult = ref(null);
const lastInviteResult = ref(null);
const holdCall = ref(false);

const currentCall = computed(() => {
  return softphone?.currentCall;
})

const contactInfoByInComingCall = computed(() => {
  return softphone?.currentCall?.contact ?? softphone?.currentCall?.call_from_user;
})

const disableTransferCall = computed(() => {
  if (agentsInCall.value.length > 1) {
    return true;
  }

  return softphoneStatus.value !== SOFTPHONE_STATUS.ANSWERED;
})

onMounted(() => {
  listenRemoteMediaStreamChange();

  contactPhoneNumber.value = softphone?.currentCall?.call_from;
  phoneNumber.value = softphone?.currentPhoneNumber;
  softphoneStatus.value = softphone.getStatus();
  micMuted.value = softphone.getMicMuted();
  soundMuted.value = softphone.getSoundMuted();

  listenSoftphoneStatus();
  listenMuteMicrophone();
  listenMuteSound();
  listenChangeTransferStatus();
  listenChangeInviteStatus();
  listenAgentsUpdated();
  listenTransferResponse();
  listenInviteResponse();
})

onUnmounted(() => {
  softphone.off(SOFTPHONE_EVENTS.REMOTE_MEDIA_STREAM_CHANGED, handleRemoteMediaStreamChange);
  softphone.off(SOFTPHONE_EVENTS.CHANGE_STATUS, handleSoftphoneStatusChange);
  softphone.off(SOFTPHONE_EVENTS.MUTE_MIC_STATUS_CHANGED, handleMuteMicrophone);
  softphone.off(SOFTPHONE_EVENTS.MUTE_SOUND_STATUS_CHANGED, handleMuteSound);
  softphone.off(SOFTPHONE_EVENTS.CHANGE_TRANSFER_STATUS, handleChangeTransferStatus);
  softphone.off(SOFTPHONE_EVENTS.CHANGE_INVITE_STATUS, handleChangeInviteStatus);
  softphone.off(SOFTPHONE_EVENTS.AGENTS_UPDATED, handleAgentsUpdated);
  softphone.off(SOFTPHONE_EVENTS.CALL_TRANSFER_RESP, handleTransferResponse);
  softphone.off(SOFTPHONE_EVENTS.CALL_INVITE_RESP, handleInviteResponse);
})

const listenInviteResponse = () => {
  softphone.on(SOFTPHONE_EVENTS.CALL_INVITE_RESP, handleInviteResponse);
}

const handleInviteResponse = (data) => {
  if (data?.req_id !== lastInviteResult.value?.req_id) {
    console.warn('Invite response does not match the latest request, ignoring.');
    return;
  }

  inviteStatus.value = false;

  if (data?.rc !== 0) {
    message.error("Mời người khác vào cuộc gọi thất bại: Người được mời từ chối hoặc không nhấc máy.", {
      duration: 10000
    });
  } else {
    message.success("Mời vào cuộc gọi thành công.");
  }
}

const listenTransferResponse = () => {
  softphone.on(SOFTPHONE_EVENTS.CALL_TRANSFER_RESP, handleTransferResponse);
}

const handleTransferResponse = (data) => {
  if (data?.req_id !== lastTransferResult.value?.req_id) {
    console.warn('Transfer response does not match the latest request, ignoring.');
    return;
  }

  transferStatus.value = false;

  if (data?.rc !== 0) {
    message.error("Chuyển cuộc gọi thất bại: Người nhận từ chối hoặc không nhấc máy.", {
      duration: 10000
    });
  } else {
    message.success("Chuyển cuộc gọi thành công.");
  }
}

const listenAgentsUpdated = () => {
  softphone.on(SOFTPHONE_EVENTS.AGENTS_UPDATED, handleAgentsUpdated);
}

const handleAgentsUpdated = (data) => {
  agentsInCall.value = data || [];
}

const listenMuteSound = () => {
  softphone.on(SOFTPHONE_EVENTS.MUTE_SOUND_STATUS_CHANGED, handleMuteSound);
};

const handleMuteSound = (muted) => {
  soundMuted.value = muted;
  remoteAudio.value.muted = muted;
}

const listenMuteMicrophone = () => {
  softphone.on(SOFTPHONE_EVENTS.MUTE_MIC_STATUS_CHANGED, handleMuteMicrophone);
};

const handleMuteMicrophone = (muted) => {
  micMuted.value = muted;
}

const listenChangeTransferStatus = () => {
  softphone.on(SOFTPHONE_EVENTS.CHANGE_TRANSFER_STATUS, handleChangeTransferStatus);
};

const listenChangeInviteStatus = () => {
  softphone.on(SOFTPHONE_EVENTS.CHANGE_INVITE_STATUS, handleChangeInviteStatus);
};

const listenSoftphoneStatus = () => {
  softphone.on(SOFTPHONE_EVENTS.CHANGE_STATUS, handleSoftphoneStatusChange)
}

const handleChangeInviteStatus = (newStatus) => {
  inviteStatus.value = newStatus;
};

const handleChangeTransferStatus = (newStatus) => {
  transferStatus.value = newStatus;
};

const handleSoftphoneStatusChange = (newStatus) => {
  softphoneStatus.value = newStatus;
};

const listenRemoteMediaStreamChange = () => {
  softphone.on(SOFTPHONE_EVENTS.REMOTE_MEDIA_STREAM_CHANGED, handleRemoteMediaStreamChange);
};

const handleRemoteMediaStreamChange = (stream) => {
  if (remoteAudio.value) {
    remoteAudio.value.srcObject = stream;
  }
}

const handleTransferResult = (data) => {
  lastTransferResult.value = data;
}

const handleInviteResult = (data) => {
  lastInviteResult.value = data;
}

const formatPhoneNumber = (number) => {
  return VietnamPhoneFormatter.format(number);
}

const handleEndCall = () => {
  softphone.endCall();
}

const gotoContactDetail = () => {
}

const muteMicrophone = () => {
  softphone.setMicMuted(!micMuted.value);
}

const muteSound = () => {
  softphone.setSoundMuted(!soundMuted.value);
}

const toggleHoldCall = () => {
  holdCall.value = !holdCall.value;
  softphone.setHoldCall(holdCall.value);
}
</script>

<template>
  <div class="calling-tab">
    <div class="calling-info">
      <AvatarContact :link="contactInfoByInComingCall?.photo_url" :name="getFullName(contactInfoByInComingCall) || contactPhoneNumber || phoneNumber || '?'" :size="64"/>
      <p class="contact-name" @click="gotoContactDetail()">
        {{ getFullName(contactInfoByInComingCall) || contactPhoneNumber || phoneNumber }}
      </p>
      <p class="contact-phone">{{ formatPhoneNumber(contactPhoneNumber) || phoneNumber }}</p>
      <span class="call-direction-badge" :class="currentCall?.direction === CALL_DIRECTION.INBOUND ? 'inbound' : 'outbound'">
        <m-icon :size="12" :icon-name="currentCall?.direction === CALL_DIRECTION.INBOUND ? 'call_received' : 'call_made'"/>
        {{ currentCall?.direction === CALL_DIRECTION.INBOUND ? 'Đang gọi vào' : 'Đang gọi ra' }}
      </span>
      <p class="call-duration">
        <RingingOutText :status="softphoneStatus" v-if="softphoneStatus === SOFTPHONE_STATUS.RINGING_OUT || softphoneStatus === SOFTPHONE_STATUS.TRYING"/>
        <CountTime v-else />
      </p>
      <div class="call-group-text" v-if="agentsInCall.length > 1">
        <m-icon :size="14" icon-name="groups"/> Cuộc gọi nhóm
        <n-popover trigger="hover">
          <template #trigger>
            <span class="group-agents-count">({{ agentsInCall.length }})</span>
          </template>
          <div>
            <div class="d-flex-ok" v-for="item in agentsInCall" :key="item?.id">
              <AvatarContact :link="item?.photo_url" :size="26"/>
              <div class="agent-info text-color-primary"><p>{{ item?.name }}</p></div>
            </div>
          </div>
        </n-popover>
      </div>
      <div v-if="transferStatus" class="transfer-status">
        <n-spin :size="12" /> <span>Đang chuyển cuộc gọi...</span>
      </div>
      <div v-if="inviteStatus" class="transfer-status">
        <n-spin :size="12" /> <span>Đang chờ người được mời đồng ý...</span>
      </div>
    </div>

    <audio ref="remoteAudio" style="display: none;" autoplay></audio>

    <div class="calling-action">
      <div class="action-row">
        <n-button :disabled="holdCall" @click="muteMicrophone()" class="btn-action" text>
          <m-icon :icon-name="micMuted ? 'mic' : 'mic_off'"/>
          {{ micMuted ? 'Bật mic' : 'Tắt mic' }}
        </n-button>
        <n-button @click="toggleHoldCall()" class="btn-action" text>
          <m-icon :icon-name="holdCall ? 'play_arrow' : 'pause'"/>
          {{ holdCall ? 'Tiếp tục' : 'Tạm giữ' }}
        </n-button>
        <n-button :disabled="holdCall" @click="muteSound()" class="btn-action" text>
          <m-icon :icon-name="soundMuted ? 'volume_up' : 'volume_off'"/>
          {{ soundMuted ? 'Bật âm' : 'Tắt âm' }}
        </n-button>
      </div>
      <div class="action-row">
        <n-button :disabled="disableTransferCall" @click="isShowTransferModal = true" class="btn-action" text>
          <m-icon icon-name="phone_forwarded"/>
          Chuyển tiếp
        </n-button>
        <n-button @click="isShowInviteModal = true" class="btn-action" text>
          <m-icon icon-name="person_add"/>
          Mời người khác
        </n-button>
        <n-button disabled class="btn-action" text>
          <m-icon icon-name="block"/>
          Chặn
        </n-button>
      </div>
    </div>

    <div class="end-call-row">
      <n-button @click="handleEndCall" class="btn-end-call" circle type="error" size="large">
        <m-icon :size="22" icon-name="call_end" />
      </n-button>
    </div>

    <TransferCallModal v-model:show="isShowTransferModal" @transferResult="handleTransferResult"/>
    <InviteToCallModal v-model:show="isShowInviteModal" @inviteResult="handleInviteResult"/>
  </div>
</template>

<style scoped>
.calling-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .calling-info {
    padding: 12px 0 8px;
    text-align: center;

    .contact-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), #27ae60);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
      font-size: 26px;
      color: #fff;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(51, 159, 89, 0.35);
    }

    .contact-name {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      transition: color 0.2s;
      margin-bottom: 2px;

      &:hover { color: var(--color-primary); }
    }

    .contact-phone {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .call-direction-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      padding: 3px 10px;
      border-radius: 20px;
      font-weight: 500;
      margin-bottom: 4px;

      &.inbound {
        background: rgba(52, 199, 89, 0.1);
        color: #16a34a;
      }
      &.outbound {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }
    }

    .call-duration {
      font-size: 13px;
      font-weight: 300;
      color: var(--color-primary);
      letter-spacing: 1px;
      margin-top: 4px;
    }

    .call-group-text {
      color: var(--color-primary);
      font-size: 12px;
      margin-top: 4px;

      .group-agents-count {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    .transfer-status {
      justify-content: center;
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
  }

  .calling-action {
    background: rgba(0,0,0,0.03);
    border-radius: 14px;
    padding: 8px 4px;
    margin: 12px 0;

    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .btn-action {
        flex: 1;
        padding: 8px 4px;
        border-radius: 10px;
        color: #475569;
        transition: all 0.15s;

        &:hover:not(:disabled) {
          background: rgba(0,0,0,0.06);
          color: #1e293b;
        }

        &:disabled { opacity: 0.35; }
      }
    }
  }

  .end-call-row {
    display: flex;
    justify-content: center;
    padding: 4px 0 8px;

    .btn-end-call {
      width: 56px;
      height: 56px;
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.35);
      transition: all 0.2s ease;

      &:hover {
        transform: scale(1.06);
        box-shadow: 0 6px 20px rgba(239, 68, 68, 0.45);
      }
      &:active { transform: scale(0.96); }
    }
  }
}

.calling-action .btn-action :deep(.n-button__content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
}
</style>