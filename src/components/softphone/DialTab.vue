<script setup>
import {BackspaceOutline, Call, PhonePortraitOutline, PersonOutline, SearchOutline} from "@vicons/ionicons5";
import {inject, onMounted, ref, watch} from "vue";

import WorkspaceUser from "@/services/WorkspaceUser.js";
import {SOFTPHONE_MODE_KEY} from "@/const/StorageKey.js";


const inputPhoneNumber = ref('');
const softphone = inject("softphone");
const mode = ref('external'); // 'external' or 'internal'

onMounted(() => {
  const savedMode = localStorage.getItem(SOFTPHONE_MODE_KEY);

  if (savedMode) {
    mode.value = savedMode;
    softphone.setDialMode(savedMode);
  }
});

watch(mode, (val) => {
  localStorage.setItem(SOFTPHONE_MODE_KEY, val);
  softphone.setDialMode(val);
});

// Internal mode
const searchQuery = ref('');
const userList = ref([]);
const searching = ref(false);
let searchTimer = null;

const clickButtonKeyboard = (value) => {
  if (value === 'backspace') {
    inputPhoneNumber.value = inputPhoneNumber.value.slice(0, -1);
  } else {
    inputPhoneNumber.value += value;
  }
};

const handleBackspace = () => {
  inputPhoneNumber.value = inputPhoneNumber.value.slice(0, -1);
};

const handleMakeCall = () => {
  softphone.makeCall(inputPhoneNumber.value);
};

const searchUsers = () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    searching.value = true;
    try {
      const res = await WorkspaceUser.getUserOnline({ key: searchQuery.value });
      userList.value = res?.data?.data || [];
    } catch (e) {
      userList.value = [];
    } finally {
      searching.value = false;
    }
  }, 300);
};

const getDisplayName = (user) => {
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return full || user.email || user.username || '';
};

const getAvatarInitial = (user) => {
  return getDisplayName(user)[0]?.toUpperCase() || '?';
};

const callInternalUser = (user) => {
  softphone.makeCall(String(user.user_id), user);
};

onMounted(() => searchUsers());

watch(mode, (newMode) => {
  if (newMode === 'internal' && userList.value.length === 0) {
    searchUsers();
  }
});
</script>

<template>
  <div class="dial-tab">
    <!-- Mode toggle -->
    <div class="mode-toggle">
      <button class="mode-btn" :class="{ active: mode === 'external' }" @click="mode = 'external'">
        <n-icon :size="15"><PhonePortraitOutline/></n-icon>
        SIP
      </button>
      <button class="mode-btn" :class="{ active: mode === 'internal' }" @click="mode = 'internal'">
        <n-icon :size="15"><PersonOutline/></n-icon>
        WebRTC
      </button>
    </div>

    <!-- Content area: fixed height for both modes -->
    <div class="mode-content">

    <!-- External mode: dial pad -->
    <div v-if="mode === 'external'" class="dial-tab-content">
      <div class="box-phone-number">
        <div class="phone-display">
          <input
            v-model="inputPhoneNumber"
            class="input-phone-number"
            inputmode="numeric"
            pattern="[0-9]{10,11}"
            name="input-phone-number"
            type="tel"
            placeholder="Nhập số điện thoại"
          />
          <n-button
            @click.stop="handleBackspace"
            text
            size="large"
            :class="inputPhoneNumber.length === 0 ? 'hidden-button' : ''"
            class="backspace-btn"
          >
            <n-icon size="18"><BackspaceOutline/></n-icon>
          </n-button>
        </div>
      </div>

      <div class="keyboard-box">
        <div class="row-keyboard">
          <n-button @click.stop="clickButtonKeyboard(1)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">1</span><span class="btn-sub">&nbsp;</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard(2)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">2</span><span class="btn-sub">ABC</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard(3)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">3</span><span class="btn-sub">DEF</span></div>
          </n-button>
        </div>
        <div class="row-keyboard">
          <n-button @click.stop="clickButtonKeyboard(4)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">4</span><span class="btn-sub">GHI</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard(5)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">5</span><span class="btn-sub">JKL</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard(6)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">6</span><span class="btn-sub">MNO</span></div>
          </n-button>
        </div>
        <div class="row-keyboard">
          <n-button @click.stop="clickButtonKeyboard(7)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">7</span><span class="btn-sub">PQRS</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard(8)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">8</span><span class="btn-sub">TUV</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard(9)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">9</span><span class="btn-sub">WXYZ</span></div>
          </n-button>
        </div>
        <div class="row-keyboard">
          <n-button @click.stop="clickButtonKeyboard('*')" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num btn-sym">*</span><span class="btn-sub">&nbsp;</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard(0)" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num">0</span><span class="btn-sub">+</span></div>
          </n-button>
          <n-button @click.stop="clickButtonKeyboard('#')" text class="btn-keyboard">
            <div class="keyboard-content"><span class="btn-num btn-sym">#</span><span class="btn-sub">&nbsp;</span></div>
          </n-button>
        </div>

        <div class="call-action-row">
          <n-button
            :disabled="!inputPhoneNumber"
            class="btn-make-call"
            @click="handleMakeCall()"
            size="large"
            type="primary"
            circle
          >
            <n-icon :size="24"><Call/></n-icon>
          </n-button>
        </div>
      </div>
    </div>

    <!-- Internal mode: user search -->
    <div v-else class="internal-tab-content">
      <div class="internal-search">
        <n-icon :size="16" class="search-icon"><SearchOutline/></n-icon>
        <input
          v-model="searchQuery"
          @input="searchUsers"
          class="internal-search-input"
          placeholder="Tìm tên người dùng..."
          autofocus
        />
      </div>

      <div class="user-list">
        <div v-if="searching" class="user-list-empty">
          <n-spin size="small"/>
        </div>
        <div v-else-if="userList.length === 0" class="user-list-empty">
          <span>Không có người dùng nào</span>
        </div>
        <div
          v-for="user in userList"
          :key="user.id || user.username"
          class="user-item"
        >
          <div class="user-avatar">
            <img v-if="user.photo_url" :src="user.photo_url" :alt="getDisplayName(user)"/>
            <span v-else class="user-avatar-placeholder">{{ getAvatarInitial(user) }}</span>
          </div>
          <div class="user-info">
            <p class="user-name">{{ getDisplayName(user) }}</p>
            <p class="user-email" v-if="user.email">{{ user.email }}</p>
          </div>
          <n-button
            circle
            type="primary"
            size="small"
            class="btn-call-user"
            @click="callInternalUser(user)"
          >
            <n-icon :size="16"><Call/></n-icon>
          </n-button>
        </div>
      </div>
    </div>

    </div> <!-- end .mode-content -->
  </div>
</template>

<style scoped lang="scss">
.dial-tab {
  width: 100%;

  .mode-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 10px;
    padding: 3px;
    gap: 2px;
    margin-bottom: 14px;

    .mode-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 7px 0;
      border: none;
      background: transparent;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover { color: #475569; }

      &.active {
        background: #fff;
        color: var(--color-primary);
        box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .mode-content {
    /* 430px total - mode-toggle(44px) - margin-bottom(14px) */
    height: 372px;
    overflow: hidden;
  }

  .dial-tab-content {
    width: 100%;

    .box-phone-number {
      margin-bottom: 12px;

      .phone-display {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.04);
        border-radius: 14px;
        padding: 4px 12px;
        transition: background 0.2s;

        &:focus-within { background: rgba(0, 0, 0, 0.07); }

        .input-phone-number {
          flex: 1;
          padding: 8px 4px;
          font-size: 26px;
          font-weight: 300;
          border: none;
          background: transparent;
          color: #1e293b;
          text-align: center;
          letter-spacing: 2px;
          min-width: 0;

          &:focus, &:active { outline: none; }

          &::placeholder {
            font-size: 14px;
            letter-spacing: 0;
            color: #94a3b8;
            font-weight: 400;
          }
        }

        .backspace-btn {
          color: #94a3b8;
          flex-shrink: 0;
          transition: color 0.2s;
          &:hover { color: #475569; }
        }

        .hidden-button { opacity: 0; pointer-events: none; }
      }
    }

    .keyboard-box {
      .row-keyboard {
        display: flex;
        justify-content: space-between;
        margin-bottom: 2px;

        .btn-keyboard {
          flex: 1;
          padding: 8px 0;
          border-radius: 10px;
          transition: background 0.12s;
          color: inherit;

          &:hover { background: rgba(0, 0, 0, 0.06); }
          &:active { background: rgba(0, 0, 0, 0.1); }

          .keyboard-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1px;
            &:before { display: none; }
          }

          .btn-num {
            font-size: 22px;
            font-weight: 400;
            line-height: 1.25;
            color: #1e293b;
            display: block;
          }

          .btn-sym { font-size: 20px; font-weight: 500; }

          .btn-sub {
            font-size: 8px;
            color: #94a3b8;
            letter-spacing: 1.5px;
            font-weight: 600;
            display: block;
            line-height: 1;
            height: 10px;
          }
        }
      }

      .call-action-row {
        display: flex;
        justify-content: center;
        padding-top: 10px;
        margin-top: 4px;

        .btn-make-call {
          width: 58px;
          height: 58px;
          box-shadow: 0 6px 20px rgba(51, 159, 89, 0.4);
          transition: all 0.2s ease;

          &:hover:not(:disabled) {
            transform: scale(1.06);
            box-shadow: 0 8px 28px rgba(51, 159, 89, 0.5);
          }
          &:active:not(:disabled) { transform: scale(0.96); }
          &:disabled { opacity: 0.45; box-shadow: none; }
        }
      }
    }
  }

  .internal-tab-content {
    width: 100%;
    height: 372px;
    display: flex;
    flex-direction: column;

    .internal-search {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 12px;
      padding: 8px 14px;
      margin-bottom: 10px;
      transition: background 0.2s;

      &:focus-within { background: rgba(0, 0, 0, 0.07); }

      .search-icon { color: #94a3b8; flex-shrink: 0; }

      .internal-search-input {
        flex: 1;
        border: none;
        background: transparent;
        font-size: 14px;
        color: #1e293b;
        min-width: 0;
        &:focus { outline: none; }
        &::placeholder { color: #94a3b8; }
      }
    }

    .user-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
    }

    .user-list-empty {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 32px 0;
      color: #94a3b8;
      font-size: 13px;
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 10px;
      transition: background 0.12s;
      cursor: default;

      &:hover { background: rgba(0, 0, 0, 0.04); }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        flex-shrink: 0;
        overflow: hidden;
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;

        img { width: 100%; height: 100%; object-fit: cover; }

        .user-avatar-placeholder {
          color: #fff;
          font-size: 14px;
          font-weight: 600;
        }
      }

      .user-info {
        flex: 1;
        min-width: 0;

        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .btn-call-user {
        flex-shrink: 0;
        width: 32px;
        height: 32px;
        box-shadow: 0 3px 10px rgba(51, 159, 89, 0.35);
        transition: all 0.2s;
        &:hover { transform: scale(1.08); }
      }
    }
  }
}
</style>

<style lang="scss">
.dial-tab {
  .btn-keyboard .n-button__content { display: inline-block; }
}
</style>
