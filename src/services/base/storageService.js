export default {
    setItem(key, value) {
        localStorage.setItem(key, value);
    },
    getItem(key) {
        return localStorage.getItem(key);
    },
    removeItem(key) {
        localStorage.removeItem(key);
    },
    set(key, value) {
        const type = typeof value;
        let data;
        if (type === "object") {
            if (value === null) {
                data = { type: "null", value: null };
            } else {
                data = { type: Array.isArray(value) ? "array" : "object", value: value };
            }
        } else {
            data = { type, value };
        }
        localStorage.setItem(key, JSON.stringify(data));
    },
    get(key) {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        try {
            const data = JSON.parse(raw);
            switch (data.type) {
                case "number":
                case "boolean":
                case "string":
                    return data.value;
                case "null":
                    return null;
                case "object":
                case "array":
                    return data.value;
                default:
                    return undefined;
            }
        } catch {
            return undefined;
        }
    },
    remove(key) {
        localStorage.removeItem(key);
    },
}
