import {CMD_MSG} from "@/const/SocketCMD.js";
import {SESSION_STORAGE_KEYS} from "@/const/StorageKey.js";

class WebSocketClient {
    constructor() {
        this.url = '/call'; // Default WebSocket URL
        this.ws = null;
        this.isConnected = false;
        this.messageQueue = [];
        this.eventHandlers = {
            open: [],
            message: [],
            error: [],
            close: [],
        };
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = (event) => {
            this.isConnected = true;
            this._emit('open', event);
            // Send any queued messages
            while (this.messageQueue.length > 0) {
                this.ws.send(this.messageQueue.shift());
            }
        };

        this.ws.onmessage = (event) => {
            const jsonData = JSON.parse(event.data);
            this._emit(jsonData.cmd, jsonData.params);
        };

        this.ws.onerror = (event) => {
            console.error('WebSocket error:', event);
            this._emit('error', event);
        };

        this.ws.onclose = (event) => {
            this.isConnected = false;
            this._emit('close', event);

            // Attempt to reconnect after a short delay
            setTimeout(() => {
                this.connect();
            }, 1000);
        };
    }

    send(data) {
        if (typeof data !== 'string') {
            if (!data?.params) {
                data.params = {};
            }
            data.params.device_id = this.getDeviceId();

            data = JSON.stringify(data);
        }

        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            // Queue messages if not connected yet
            this.messageQueue.push(data);
        }
    }

    close(code, reason) {
        if (this.ws) {
            this.ws.close(code, reason);
        }
    }

    on(event, handler) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }

        this.eventHandlers[event].push(handler);
    }

    off(event, handler) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
        }
    }

    onMessageConvId(conv_id, handler) {
        const cmd = CMD_MSG + '_' + conv_id;
        this.on(cmd, handler);
    }

    offMessageConvId(conv_id, handler) {
        const cmd = CMD_MSG + '_' + conv_id;
        this.off(cmd, handler);
    }

    _emit(cmd, params) {
        //Nếu cmd là 'msg' thì xử lý riêng, kich hoat cho tung conv_id
        if (cmd === CMD_MSG) {
            const cmd_conv = cmd + '_' + params.conv_id;
            if (this.eventHandlers[cmd_conv]) {
                this.eventHandlers[cmd_conv].forEach(handler => handler(params));
            }
        }

        if (this.eventHandlers[cmd]) {
            this.eventHandlers[cmd].forEach(handler => handler(params));
        }
    }

    getDeviceId() {
        const deviceId = sessionStorage.getItem(SESSION_STORAGE_KEYS.TAB_DEVICE_ID);

        if (deviceId) {
            return deviceId;
        }

        const newDeviceId = crypto.randomUUID();
        sessionStorage.setItem(SESSION_STORAGE_KEYS.TAB_DEVICE_ID, newDeviceId);

        return newDeviceId;
    }
}

export default WebSocketClient;