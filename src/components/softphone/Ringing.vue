<script setup>

import MIcon from "@/components/MIcon.vue";
import VietnamPhoneFormatter from "@/helper/VietnamPhoneFormatter.js";
import CountTime from "@/components/softphone/CountTime.vue";
import {computed, inject, onMounted, onUnmounted, ref} from "vue";
import {useMessage} from "naive-ui";
import {INCOMING_CALL_TYPES, SOFTPHONE_EVENTS} from "@/const/CallConst.js";
import {getFullName} from "@/helper/ContactHelper.js";
import {useRouter} from "vue-router";
import AvatarContact from "@/components/AvatarContact.vue";

const ringtonePlayer = ref(null);
const message = useMessage();
const softphone = inject("softphone");

const contactInfoByInComingCall = ref(null);
const contactPhoneNumber = ref(null);
const router = useRouter();
const currentCall = computed(() => {
  return softphone?.currentCall;
})

onMounted(() => {
  playRingtone();
  listenPlayEndCallAudio();

  contactInfoByInComingCall.value = softphone?.currentCall?.contact ?? softphone?.currentCall?.call_from_user;
  contactPhoneNumber.value = softphone?.currentCall?.call_from;

  if (Notification.permission === "granted") {
    new Notification(
        "Cuộc gọi đến",
        {
          body: "Có cuộc gọi đến từ " + getFullName(contactInfoByInComingCall.value) || contactPhoneNumber.value,
          icon: "/public/images/logo-300x300.png"
        }
    );
  }
});

onUnmounted(() => {
  softphone.off(SOFTPHONE_EVENTS.PLAY_END_SOUND, handlePlayEndCallAudio)
});

const listenPlayEndCallAudio = () => {
  softphone.on(SOFTPHONE_EVENTS.PLAY_END_SOUND, handlePlayEndCallAudio)
};

const handlePlayEndCallAudio = () => {
  if (ringtonePlayer.value) {
    ringtonePlayer.value.pause();
    ringtonePlayer.value.currentTime = 0;
  }
}

const playRingtone = () => {
  if (ringtonePlayer.value) {
    ringtonePlayer.value.play().catch((error) => {
      console.error('Failed to play ringtone:', error);
      message.error("Do chính sách của trình duyệt bạn cần thao tác với trang web để có thể phát chuông khi có cuộc gọi đến", {
        duration: 0,
        closable: true,
      });
    });
  }
};

const formatPhoneNumber = (number) => {
  return VietnamPhoneFormatter.format(number);
}

const rejectCall = () => {
  softphone.rejectCall();
}

const answerCall = async () => {
  if (ringtonePlayer.value) {
    ringtonePlayer.value.pause();
  }
  await softphone.answerCall();
}

const gotoContactDetail = () => {
}

</script>

<template>
  <div class="ringing-tab">
    <div class="ringing-info">
      <div class="avatar-ring-wrapper">
        <div class="ring-pulse"></div>
        <div class="ring-pulse ring-pulse-2"></div>
        <AvatarContact :link="contactInfoByInComingCall?.photo_url" :name="getFullName(contactInfoByInComingCall) || contactPhoneNumber || '?'" :size="64"/>
      </div>

      <p class="contact-name" @click="gotoContactDetail()">
        {{ getFullName(contactInfoByInComingCall) || contactPhoneNumber }}
      </p>
      <p class="contact-phone">{{ formatPhoneNumber(contactPhoneNumber) }}</p>

      <span class="call-type-badge">
        <template v-if="currentCall?.ringing_type === INCOMING_CALL_TYPES.TRANSFER">
          <m-icon :size="13" icon-name="phone_forwarded"/>
          Chuyển tiếp từ <b>{{ currentCall?.ringing_data?.name || 'Agent' }}</b>
        </template>
        <template v-else-if="currentCall?.ringing_type === INCOMING_CALL_TYPES.INVITE">
          <m-icon :size="13" icon-name="person_add"/>
          Mời từ <b>{{ currentCall?.ringing_data?.name || 'Agent' }}</b>
        </template>
        <template v-else>
          Cuộc gọi đến
        </template>
      </span>

      <p class="wait-time">Chờ: <CountTime/></p>
    </div>

    <div class="call-action">
      <div class="action-btn-wrap">
        <n-button @click="rejectCall" circle class="btn-ring-ring btn-reject" type="error" size="large">
          <m-icon :size="22" icon-name="call_end" />
        </n-button>
        <p class="btn-label">Từ chối</p>
      </div>

      <div class="action-btn-wrap">
        <n-button @click="answerCall" class="btn-ring-ring btn-answer" circle type="primary" size="large">
          <m-icon :size="22" icon-name="call" />
        </n-button>
        <p class="btn-label">Trả lời</p>
      </div>
    </div>

    <audio ref="ringtonePlayer" controls loop style="display: none;">
      <source src="/media/ringtone.mp3" type="audio/ogg">
    </audio>
  </div>
</template>

<style scoped>
.ringing-tab {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .ringing-info {
    text-align: center;
    padding: 16px 0 20px;

    .avatar-ring-wrapper {
      position: relative;
      width: 80px;
      height: 80px;
      margin: 0 auto 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .ring-pulse {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 2px solid rgba(51, 159, 89, 0.4);
      animation: ringPulse 1.8s ease-out infinite;
    }

    .ring-pulse-2 {
      animation-delay: 0.6s;
    }

    .contact-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), #27ae60);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      color: #fff;
      font-weight: 600;
      box-shadow: 0 4px 14px rgba(51, 159, 89, 0.35);
      position: relative;
      z-index: 1;
    }

    .contact-name {
      font-size: 20px;
      font-weight: 600;
      color: #1e293b;
      cursor: pointer;
      margin-bottom: 2px;
      transition: color 0.2s;

      &:hover { color: var(--color-primary); }
    }

    .contact-phone {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 8px;
    }

    .call-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      padding: 3px 10px;
      border-radius: 20px;
      background: rgba(52, 199, 89, 0.1);
      color: #16a34a;
      font-weight: 500;
      margin-bottom: 6px;
    }

    .wait-time {
      font-size: 14px;
      color: #94a3b8;
    }
  }

  .call-action {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 8px 20px 16px;

    .action-btn-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .btn-ring-ring {
      width: 56px;
      height: 56px;
      transition: all 0.2s ease;

      &:hover { transform: scale(1.06); }
      &:active { transform: scale(0.96); }
    }

    .btn-answer {
      box-shadow: 0 4px 14px rgba(51, 159, 89, 0.4);
    }

    .btn-reject {
      box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
    }

    .btn-label {
      font-size: 11px;
      font-weight: 500;
      color: #64748b;
    }
  }
}

@keyframes ringPulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.7); opacity: 0; }
}
</style>