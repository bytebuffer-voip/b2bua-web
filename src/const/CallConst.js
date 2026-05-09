export const SOFTPHONE_STATUS = {
    IDLE: 'idle',
    RINGING: 'ringing',
    TRYING: 'trying',
    RINGING_OUT: 'ringing_out',
    ANSWERED: 'answered',
}

export const SOFTPHONE_EVENTS = {
    INCOMING_CALL: 'incoming_call',
    REJECTED_CALL: 'rejected_call',
    CALL_ANSWERED: 'call_answered',
    CALL_ENDED: 'call_end',
    CALL_FAILED: 'call_failed',
    CHANGE_STATUS: 'change_status',
    PLAY_END_SOUND: 'play_end_sound',
    REMOTE_MEDIA_STREAM_CHANGED: 'remote_media_stream_changed',
    UPDATE_CONTACT_INFO: 'update_contact_info',
    MUTE_MIC_STATUS_CHANGED: 'mute_mic_status_changed',
    MUTE_SOUND_STATUS_CHANGED: 'mute_sound_status_changed',
    HOLD_STATUS_CHANGED: 'hold_status_changed',
    SHOW_SOFTPHONE: 'show_softphone',
    CHANGE_TRANSFER_STATUS: 'change_transfer_status',
    CHANGE_INVITE_STATUS: 'change_invite_status',
    ANSWERED_ON_OTHER_DEVICE: 'answered_on_other_device',
    AGENTS_UPDATED: 'agents_updated',
    CALL_TRANSFER_RESP: 'call_transfer_resp',
    CALL_INVITE_RESP: 'call_invite_resp',
    NEW_NOTIFICATION: 'new_notification',
    DIAL_MODE_CHANGED: 'dial_mode_changed',
}

export const EVENT_CODES = {
    RINGING: 180,
    ANSWERED: 200,
    REJECTED: 486,
}

export const CALL_SDP_TYPES = {
    ANSWER: 'answer',
    PRANSWER: 'pranswer'
}

export const CALL_DIRECTION = {
    INBOUND: 'inbound',
    OUTBOUND: 'outbound',
}

export const INCOMING_CALL_TYPES = {
    NORMAL: 'normal',
    TRANSFER: 'transfer',
    INVITE: 'invite',
}

export const SOFTPHONE_NOTIFICATION_TYPES = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
}