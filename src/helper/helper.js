import {SESSION_STORAGE_KEYS} from "@/const/StorageKey.js";

export const deleteAppSession = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEYS.TAB_DEVICE_ID);
}
