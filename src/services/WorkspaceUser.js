import {
    WS_GET_ACCOUNT_STATUS,
    WS_GET_USER_ONLINE,
    WS_GET_WORKSPACE_USER,
    WS_INVITE_USER,
    WS_SEARCH_USER,
    WS_UPDATE_ACCOUNT_STATUS
} from "@/const/ApiEndpoints.js";
import api from "@/services/base/api.js";
import {useAuthStore} from "@/stores/store.js";
import storageService from "@/services/base/storageService.js";
import {USER_STATUS_KEY} from "@/const/StorageKey.js";

class WorkspaceUser {
    getWorkspaceUser(params = {}) {
        return api.get(WS_GET_WORKSPACE_USER, params)
    }

    getStatus(params = {}) {
        const authStore = useAuthStore();
        const statusCached = storageService.get(USER_STATUS_KEY);
        if (statusCached) {
            authStore.setUserStatusValue(statusCached);
        }
        const res = api.get(WS_GET_ACCOUNT_STATUS, params);
        res.then(res => {
            if (res?.data?.rc === 0) {
                if (res?.data?.data) {
                    authStore.setUserStatus(res.data.data);
                    if (res?.data?.data?.status) storageService.set(USER_STATUS_KEY, res.data.data.status);
                }
            }
        })
        .catch(err => {
            console.error('Failed to fetch user status:', err);
        })
        return res;
    }

    updateStatus(status) {
        const payload = {
            status: status,
            user_id: "me"
        }
        const res = api.post(WS_UPDATE_ACCOUNT_STATUS, payload);
        res.then(res => {
            if (res?.data?.rc === 0) {
                this.getStatus();
            }
        })
        return res;
    }

    inviteUser(payload) {
        return api.post(WS_INVITE_USER, payload)
    }

    getUserOnline(params) {
        if (params && params.name && params.name.trim() === '') {
            delete params.name;
        }
        return api.get(WS_GET_USER_ONLINE, params);
    }

    searchUser(key) {
        return api.get(WS_SEARCH_USER, { key });
    }
}

export default new WorkspaceUser();
