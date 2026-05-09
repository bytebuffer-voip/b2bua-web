import {
    GET_WORKPLACES_TOKEN,
    WS_GET_ME
} from "@/const/ApiEndpoints.js";
import api from "@/services/base/api.js";
import {useAuthStore} from "@/stores/store.js";
class WorkplaceService {
    constructor() {}

    getUserInfo() {
        const response = api.get(WS_GET_ME);
        response.then((res) => {
            const authStore = useAuthStore();
            if (res?.data?.data) {
                authStore.setUser(res?.data?.data);
            }
        })
        return response;
    }

    getWorkplacesToken(continueURL) {
        const payload = {
            continue: continueURL
        };
        return api.post(GET_WORKPLACES_TOKEN, payload);
    }
}

export default new WorkplaceService();
