import api from "@/services/base/api.js";
import {
    CHANGE_PASSWORD,
    GET_ME,
    LOGIN,
    LOGOUT,
    REGISTER,
    SAVE_TOKEN,
    UPDATE_USER,
    UPLOAD_AVATAR
} from "@/const/ApiEndpoints.js";
import {useAuthStore} from "@/stores/store.js";

class AccountService {
    constructor() {}

    register(firstName, lastName, email, password) {
        const payload = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password
        };
        return api.post(REGISTER, payload);
    }

    login(email, password, continueURL = '') {
        const payload = {
            email: email,
            password: password
        };
        if (continueURL) {
            payload.continue = continueURL;
        }
        return api.post(LOGIN, payload);
    }

    logout() {
        return api.post(LOGOUT, {});
    }

    saveToken(token) {
        const payload = {
            token: token
        }
        return api.post(SAVE_TOKEN, payload);
    }

    getUserInfo() {
        const response = api.get(GET_ME);
        response.then((res) => {
            const authStore = useAuthStore();
            authStore.setUser(res.data);
        })
        return response;
    }

    updateUserInfo(payload) {
        return api.post(UPDATE_USER, payload);
    }

    changePassword(payload) {
        return api.post(CHANGE_PASSWORD, payload);
    }

    uploadAvatar(fileBlob, lastFileName) {
        const formData = new FormData();
        formData.append('file', fileBlob, lastFileName || 'avatar.png');
        return api.postFormData(UPLOAD_AVATAR, formData);
    }
}

export default new AccountService();
