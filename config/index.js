export const config = {
    apiUrl: import.meta.env.VITE_API_URL,
    env: import.meta.env.VITE_ENV,
    rootDomain: import.meta.env.VITE_ROOT_DOMAIN,
    idBaseUrl: import.meta.env.VITE_ID_BASE_URL,
    fileServerBaseUrl: import.meta.env.VITE_FILE_SERVER_BASE_URL,
    iceServers: [
        {
            urls: import.meta.env.VITE_TURN_URL,
            credential: import.meta.env.VITE_TURN_CREDENTIAL,
            username: import.meta.env.VITE_TURN_USERNAME,
        }
    ],
}
