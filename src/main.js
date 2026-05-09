import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import naive from 'naive-ui'
import router from './router'
import { createPinia } from 'pinia'
import accountService from "@/services/AccountService.js";
import workplacesService from "@/services/WorkplacesService.js";
import WebSocketClient from "@/services/websocket/WebSocketClient.js";
import 'material-icons/iconfont/material-icons.css';
import Softphone from "@/components/softphone/handler/Softphone.js";
import {deleteAppSession} from "@/helper/helper.js";

deleteAppSession();

const pinia = createPinia();

async function bootstrap() {
    const app = createApp(App)
    app.use(pinia);
    let ws = null;

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            await accountService.saveToken(token);
        }

        let resGetMe = await workplacesService.getUserInfo();

        const loadingEl = document.querySelector('.loading-init');
        if (loadingEl) loadingEl.remove();

        if (resGetMe && resGetMe.status === 200) {
            ws = new WebSocketClient();
            ws.connect();
        }
    } catch (e) {
        console.error('Bootstrap failed:', e);
    }

    const softphone = new Softphone(ws);

    app.provide('ws', ws);
    app.provide('softphone', softphone);
    app.use(naive)
    app.use(router)
    app.mount('#app')

    softphone.initListen();
}

await bootstrap();
