// Auth
export const LOGIN = '/api/auth/login';
export const LOGOUT = '/api/logout';
export const REGISTER = '/api/auth/register';
export const UPDATE_USER = '/api/users/update';
export const CHANGE_PASSWORD = '/api/users/change-password';
export const GET_ME = '/api/users/v2/me';
export const UPLOAD_AVATAR = '/api/upload/image';
export const SAVE_TOKEN = '/api/check-token';

// Workplace
export const GET_WORKPLACES_TOKEN = 'api/auth/create-workplace-token';

// Workspace user
export const WS_GET_ME = 'api/user/me';
export const WS_INVITE_USER = 'api/user/invite';
export const WS_GET_WORKSPACE_USER = 'api/user';
export const WS_GET_ACCOUNT_STATUS = 'api/user-status';
export const WS_UPDATE_ACCOUNT_STATUS = 'api/user-status/change';
export const WS_GET_USER_ONLINE = '/api/user/others';
export const WS_SEARCH_USER = '/api/user/search';

// Queue (used by transfer call modal)
export const WS_QUEUE = '/api/queue';
export const WS_QUEUE_ADD_GROUP = '/api/queue/add-group';
export const WS_QUEUE_REMOVE_GROUP = '/api/queue/remove-group';
export const WS_LIST_QUEUE_GROUP = '/api/queue/list-group/{queue_id}';
export const WS_QUEUE_SORT_GROUP = '/api/queue/sort-group';
