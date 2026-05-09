import axios from 'axios'
import {useAuthStore} from "@/stores/store.js";
import {config} from "../../../config/index.js";
import {getWorkplaceDomain} from "@/helper/workplaceHelper.js";

export default {
    DEFAULT_TIME_OUT: 30000,
    BASE_URL: config.apiUrl,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 500,

    post(url, data, params = null, headers = [], tm = this.DEFAULT_TIME_OUT) {
        return this.request(url, 'POST', params, data, headers, tm);
    },

    postFormData(url, formData, params = null, headers = [], tm = this.DEFAULT_TIME_OUT) {
        headers.push('Content-Type', 'multipart/form-data');
        return this.post(url, formData, params, headers, tm);
    },

    get(url, params = null, headers = [], tm = this.DEFAULT_TIME_OUT) {
        return this.request(url, 'GET', params, null, headers, tm);
    },

    put(url, data, params = null, headers = [], tm = this.DEFAULT_TIME_OUT) {
        return this.request(url, 'PUT', params, data, headers, tm);
    },

    delete(url, data, params = null, headers = [], tm = this.DEFAULT_TIME_OUT) {
        return this.request(url, 'DELETE', params, data, headers, tm);
    },

    async request(url, method, queryParams, bodyData, headers = null, timeout = this.DEFAULT_TIME_OUT, retryCount = 0) {
        const axiosConfig = {
            method: method,
            url: url,
            baseURL: this.BASE_URL,
            timeout: timeout
        };

        if (config.env === 'local') {
            axiosConfig.withCredentials = true;
        }

        if (queryParams) {
            axiosConfig.params = queryParams;
        }
        if (bodyData) {
            axiosConfig.data = bodyData;
        }

        let defaultHeaders = {};
        const workplacesDomain = getWorkplaceDomain();
        if (workplacesDomain) {
            defaultHeaders['x-subdomain'] = workplacesDomain;
        }

        if (headers) {
            defaultHeaders = {...defaultHeaders, ...headers}
        }

        axiosConfig.headers = defaultHeaders;

        try {
            const response = await axios(axiosConfig);
            this._processResponse(response);
            return response;
        } catch (error) {
            if (error.response && error.response.status >= 500 && retryCount < this.MAX_RETRIES) {
                console.warn(`Retrying ${method} ${url}... [${retryCount + 1}/${this.MAX_RETRIES}]`);
                await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS));
                return this.request(url, method, queryParams, bodyData, headers, timeout, retryCount + 1);
            }

            this._processError(error);
            throw error;
        }
    },

    _processError(err) {
        console.error('Request failed:', err);
        if (err.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.setToken('');
            authStore.setUser({});
        }
    },

    _processResponse(response) {
        if (response?.status === 401) {
            const authStore = useAuthStore();
            authStore.setToken('');
            authStore.setUser({});
        }
    },
}
