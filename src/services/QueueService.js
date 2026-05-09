import api from "@/services/base/api.js";
import {
    WS_LIST_QUEUE_GROUP,
    WS_QUEUE,
    WS_QUEUE_ADD_GROUP,
    WS_QUEUE_REMOVE_GROUP,
    WS_QUEUE_SORT_GROUP
} from "@/const/ApiEndpoints.js";

class QueueService {
    constructor() {}

    createQueue(params = {}) {
        return api.post(WS_QUEUE, params);
    }

    getQueues(params = {}) {
        return api.get(WS_QUEUE, params);
    }

    updateQueue(params = {}) {
        return api.put(WS_QUEUE, params);
    }

    deleteQueue(ids = []) {
        return api.delete(WS_QUEUE, {
            ids: ids
        });
    }

    addGroupToQueue(params = {}) {
        return api.post(WS_QUEUE_ADD_GROUP, params);
    }

    removeGroupFromQueue(params = {}) {
        return api.post(WS_QUEUE_REMOVE_GROUP, params);
    }

    getGroupsInQueue(queueId) {
        const url = WS_LIST_QUEUE_GROUP.replace("{queue_id}", queueId);
        return api.get(url);
    }

    sortGroup(payload) {
        return api.post(WS_QUEUE_SORT_GROUP, payload);
    }
}

export default new QueueService();