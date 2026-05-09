<script setup>

import {NButton} from "naive-ui";
import {Close} from "@vicons/ionicons5";
import workspaceUser from "@/services/WorkspaceUser.js";
import {inject, ref, watch} from "vue";
import AvatarContact from "@/components/AvatarContact.vue";
import _ from "lodash";
import queueService from "@/services/QueueService.js";
import {useAuthStore} from "@/stores/store.js";

const TRANSFER_TYPES = {
  AGENT: 'agent',
  QUEUE: 'queue',
};

const emit = defineEmits(['transferResult']);
const authStore = useAuthStore();
const softphone = inject("softphone");
const modalShow = defineModel('show');
const agents = ref([]);
const queues = ref([]);
const isLoadingAgent = ref(false);
const isLoadingQueue = ref(false);
const params = ref({
  name: null
})
const paramsQueue = ref({
  name: null
})
const transferData = ref({
  type: null,
  id: null,
});
const tabActive = ref('transfer-agent');

const getAgentOnline = () => {
  isLoadingAgent.value = true;

  workspaceUser.getUserOnline(params.value).then(res => {
    isLoadingAgent.value = false;
    if (res?.data?.rc === 0) {
      agents.value = res?.data?.data || [];
    }
  }).catch(e => {
    isLoadingAgent.value = false;
    console.error('Error fetching online agents:', e);
  })
}

const debounceSearchAgent = _.debounce(getAgentOnline, 500);

const getQueue = () => {
  isLoadingQueue.value = true;

  queueService.getQueues(paramsQueue.value).then(res => {
    isLoadingQueue.value = false;
    if (res?.data?.rc === 0) {
      queues.value = res?.data?.data || [];
    }
  }).catch(e => {
    isLoadingQueue.value = false;
    console.error('Error fetching queues:', e);
  })
}

const getDisplayName = (user) => {
  const full = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return full || user.email || user.username || '';
};

const selectAgent = (agent) => {
  if (authStore?.user?.user_id === agent.user_id) {
    return;
  }
  transferData.value.type = TRANSFER_TYPES.AGENT;
  transferData.value.id = agent.user_id;
}

const selectQueue = (queue) => {
  transferData.value.type = TRANSFER_TYPES.QUEUE;
  transferData.value.id = queue.id;
}

const debounceSearchQueue = _.debounce(getQueue, 500);

const handleChangeTab = () => {
  transferData.value = {
    type: null,
    id: null,
  };
}

const transferCall = () => {
  transferData.value.req_id = crypto.randomUUID();

  softphone.transferCall(transferData.value, transferData.value.req_id);
  modalShow.value = false;
  emit('transferResult', transferData.value);
}

watch(() => modalShow.value, (newVal) => {
  if (newVal) {
    getAgentOnline();
    getQueue();
  }
});
</script>

<template>
  <n-modal v-model:show="modalShow" :close-on-esc="false" :mask-closable="false">
    <n-card style="width: 600px;" class="custom-card-1">
      <div class="card-header">
        Chuyển cuộc gọi
        <n-button @click="modalShow = false" text>
          <n-icon :size="26">
            <Close/>
          </n-icon>
        </n-button>
      </div>
      <div class="card-body">
        <div class="card-session">
          <n-form>
            <n-tabs @update:value="handleChangeTab" type="line" animated>
              <n-tab-pane name="transfer-agent" tab="Chuyển đến nhân sự khác">
                <div class="mb-common">
                  <n-input v-model:value="params.name" @input="debounceSearchAgent" placeholder="Tìm kiếm nhân sự"/>
                </div>

                <n-spin v-model:show="isLoadingAgent">
                  <div class="list-box" v-if="agents && agents.length > 0">
                    <div v-for="agent in agents" :key="agent.user_id">
                      <n-radio
                          :checked="transferData.id === agent.user_id && transferData.type === TRANSFER_TYPES.AGENT"
                          class="custom-radio-transfer-call"
                          name="agent"
                          :disabled="authStore?.user?.user_id === agent.user_id"
                          @click="selectAgent(agent)"
                      >
                        <div class="agent-info">
                          <avatar-contact :link="agent.photo_url" :name="getDisplayName(agent)"/>
                          <div class="agent-text">
                            <span class="agent-name">{{ getDisplayName(agent) }}</span>
                            <span class="agent-email" v-if="agent.email">{{ agent.email }}</span>
                          </div>
                        </div>
                      </n-radio>
                    </div>
                  </div>
                  <div v-else style="min-height: 120px;">
                    Không tìm thấy nhân sự nào đang trực tuyến
                  </div>
                </n-spin>

              </n-tab-pane>

              <n-tab-pane name="transfer-queue" tab="Chuyển đến hàng đợi">
                <div class="mb-common">
                  <n-input v-model:value="paramsQueue.name" @input="debounceSearchQueue" placeholder="Tìm kiếm hàng đợi"/>
                </div>

                <n-spin v-model:show="isLoadingQueue">
                  <div class="list-box" v-if="queues && queues.length > 0">
                    <div v-for="queue in queues" :key="queue.id">
                      <n-radio
                          :checked="transferData.id === queue.id && transferData.type === TRANSFER_TYPES.QUEUE"
                          class="custom-radio-transfer-call"
                          name="queue"
                          @click="selectQueue(queue)"
                      >
                        <div class="d-flex-common">
                          {{queue.name}}
                        </div>
                      </n-radio>
                    </div>
                  </div>
                  <div v-else style="min-height: 120px;">
                    Không tìm thấy hàng đợi nào
                  </div>
                </n-spin>
              </n-tab-pane>
            </n-tabs>
          </n-form>
        </div>
      </div>
      <div class="card-box-ctrl">
        <n-button @click="modalShow = false" size="small">Hủy</n-button>
        <n-button
            :disabled="!transferData.id"
            type="primary"
            size="small"
            @click="transferCall"
        >
          Chuyển cuộc gọi
        </n-button>
      </div>
    </n-card>
  </n-modal>
</template>

<style scoped>
.custom-radio-transfer-call{
  display: flex;
  gap: 15px;
  align-items: center;
  border-radius: 8px;
  padding: 10px 0;

  &:hover{
    background: var(--color-background-hover);
  }
}

.agent-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.agent-text {
  display: flex;
  flex-direction: column;
}

.agent-name {
  font-size: 13px;
  font-weight: 500;
}

.agent-email {
  font-size: 11px;
  color: var(--color-text-muted);
  opacity: 0.7;
}

.card-box-ctrl{
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0px 15px 15px 15px;
}

.list-box{
  max-height: calc(100vh - 300px);
  overflow: auto;
}
</style>