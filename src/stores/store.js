import { defineStore } from 'pinia'
import storageService from "@/services/base/storageService.js";
import {TOKEN_KEY} from "@/const/StorageKey.js";

export const useAppStore = defineStore('app', {
    state: () => ({
        pageTitle: '',
        context: '',
    }),
    actions: {
        setPageTitle(title) {
            this.pageTitle = title;
        }
    }
})

export const useWorkplaceStore = useAppStore;

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user_status: {
            last_updated: null,
            status: "",
            user_id: "",
            workplace_id: "",
        },
        token: '',
        user: {
            avatar: '',
            display_name: '',
            first_name: '',
            last_name: '',
            domain: '',
            title: '',
            workplace_id: '',
            workplace_user_id: '',
            user_id: '',
            username: '',
            current_balance: '',
            email: '',
            language_code: '',
            phone_number: '',
            photo_url: '',
            time_zone: '',
        },
        walletInfo: null,
        packets: [],
        permissionMap: {},
    }),
    actions: {
        setUserStatus(value) {
            if (value) {
                const keys = Object.keys(this.user_status);
                keys.forEach((key) => {
                    if (value[key]) {
                        this.user_status[key] = value[key];
                    }
                })
            }
        },
        setPermissionMap(value) {
            this.permissionMap = value;
        },
        setUserStatusValue(status) {
            this.user_status.status = status;
        },
        setUser(value) {
            if (value) {
                const keys = Object.keys(this.user);
                keys.forEach((key) => {
                    if (value[key]) {
                        this.user[key] = value[key];
                    }
                })
            }
        },
        unsetUserOnLogOut() {
            this.user = {
                avatar: '',
                display_name: '',
                domain: '',
                title: '',
                workplace_id: '',
                workplace_user_id: '',
                user_id: '',
                email: '',
                username: '',
                first_name: '',
                last_name: '',
                language_code: '',
                photo_url: '',
                current_balance: 0,
            };
            this.user_status = {
                last_updated: null,
                status: "",
                user_id: "",
                workplace_id: "",
            };
        },
        setToken(value) {
            this.token = value;
            storageService.setItem(TOKEN_KEY, value);
        }
    },
    getters: {
        getToken() {
            if (this.token) {
                return this.token;
            }
            const tokenSaved = storageService.getItem(TOKEN_KEY);
            if (tokenSaved) {
                this.token = tokenSaved;
                return tokenSaved;
            }
        },
        getUser() {
            return this.user;
        },
        getAuthStatus() {
            return !!this.user.user_id;
        }
    },
})
