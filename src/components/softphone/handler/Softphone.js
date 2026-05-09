import {
    CALL_DIRECTION,
    CALL_SDP_TYPES,
    EVENT_CODES,
    SOFTPHONE_EVENTS,
    SOFTPHONE_NOTIFICATION_TYPES,
    SOFTPHONE_STATUS
} from "@/const/CallConst.js";
import {
    CALL_ANSWER_REQ, CALL_CANDIDATE_NTF,
    CALL_CANDIDATE_REQ,
    CALL_END_REQ, CALL_INVITE_REQ, CALL_INVITE_RES, CALL_OUT_ANSWER_NTF, CALL_OUT_REMOTE_SDP, CALL_OUT_RINGING,
    CALL_START_REQ,
    CALL_START_RES, CALL_TRANSFER_REQ, CALL_TRANSFER_RES, CALL_UPDATE_INVITE_CALL_NTF, CANDIDATE_COMPLETED_REQ,
    IN_CALL_NTF, IN_CALL_RESP,
    UPDATE_CALL_NTF, UPDATE_CALL_RESP,
} from "@/const/SocketCMD.js";
import webRTC from "@/components/softphone/handler/WebRTC.js";
import WebRTC from "@/components/softphone/handler/WebRTC.js";

class Softphone {
    constructor(ws) {
        this.status = SOFTPHONE_STATUS.IDLE;
        this.micMuted = false;
        this.soundMuted = false;
        this.micDeviceId = null;
        this.ws = ws;
        this.currentCall = null;
        this.eventHandlers = {
        };
        this.currentRequestMakeCallId = null;
        this.currentPhoneNumber = null;
        this.currentHotlineNumber = null;
        this.dialMode = 'external';
    }

    setDialMode(mode) {
        this.dialMode = mode;
        this.emit(SOFTPHONE_EVENTS.DIAL_MODE_CHANGED, mode);
    }

    resetCall() {
        this.setStatus(SOFTPHONE_STATUS.IDLE);
        this.currentCall = null;
        this.micMuted = false;
        this.soundMuted = false;
        this.holdCall = false;
        this.currentRequestMakeCallId = null;
        this.currentPhoneNumber = null;
        this.currentHotlineNumber = null;
        this.candidateCompletedSent = false;
        this.clearCandidateTimeout();
    }


    setStatus(status) {
        this.status = status;
        this.emit(SOFTPHONE_EVENTS.CHANGE_STATUS, status);
    }

    getStatus() {
        return this.status;
    }

    setMicMuted(micMuted) {
        if (micMuted === this.micMuted) {
            return;
        }

        this.micMuted = micMuted;
        this.handleChangeMicMute(micMuted);
    }

    getMicMuted() {
        return this.micMuted;
    }

    setSoundMuted(soundMuted) {
        if (soundMuted === this.soundMuted) {
            return;
        }

        this.soundMuted = soundMuted;
        this.emit(SOFTPHONE_EVENTS.MUTE_SOUND_STATUS_CHANGED, soundMuted);
    }

    getSoundMuted() {
        return this.soundMuted;
    }

    setHoldCall(holdCall) {
        if (holdCall === this.holdCall) {
            return;
        }

        this.holdCall = holdCall;
        this.setSoundMuted(holdCall);
        this.setMicMuted(holdCall);
        this.emit(SOFTPHONE_EVENTS.HOLD_STATUS_CHANGED, holdCall);
    }

    getHoldCall() {
        return this.holdCall;
    }

    setAgentsForCall(agents) {
        this.emit(SOFTPHONE_EVENTS.AGENTS_UPDATED, agents);
        if (this.currentCall) {
            this.currentCall.agents = agents;
        }
    }

    initListen() {
        if (!this.ws) {
            console.warn('WebSocket is not initialized.');
            return;
        }
        this.listenIncomingCall();
        this.listenEndCall();
        this.listenAnsweredOnOtherDevice();
        this.listenOnicecandidate();
        this.listenOntrack();
        this.listenMakeCallResponse();
        this.listenCallOutRemoteSDP();
        this.listenCallOutAnswered();
        this.listenCallOutRinging();
        this.listenUpdateInviteCallNTF();
        this.listenTransferResponse();
        this.listenInviteResponse();
        this.listenCandidateNTF();
        this.listenInCallNTF();
        this.listenUpdateCallNTF();
    }

    listenInCallNTF() {
        this.ws.on(IN_CALL_NTF, (data) => this.handleInCallNTF(data));
    }

    handleInCallNTF(data) {
        const result = !!this.currentCall;
        this.ws.send({
            cmd: IN_CALL_RESP,
            params: {
                call_id: data?.call_id,
                result: result,
            }
        });
    }

    listenUpdateInviteCallNTF() {
        const vm = this;
        this.ws.on(CALL_UPDATE_INVITE_CALL_NTF, (data) => vm.handleUpdateInviteCallNTF(data));
    }

    listenCandidateNTF() {
        const vm = this;
        this.ws.on(CALL_CANDIDATE_NTF, (data) => vm.handleCandidateNTF(data));
    }

    handleCandidateNTF(data) {
        if (data?.call_id !== this.currentCall.call_id) {
            return;
        }
        if (!this.currentCall.remoteCandidate) {
            this.currentCall.remoteCandidate = [];
        }

        //Kiểm tra current call đã có sdp chưa nếu có rồi thì add candidate vào luôn
        if (this.currentCall.remote_sdp) {
            webRTC.addIceCandidate(data);

        } else {
            //Nếu chưa có sdp thì lưu lại để xử lý sau khi có sdp
            this.currentCall.remoteCandidate.push(data);
        }
    }

    handleUpdateInviteCallNTF(data) {
        this.emit(SOFTPHONE_EVENTS.CHANGE_INVITE_STATUS, false);

        if (this.currentCall && data?.call_id === this.currentCall.call_id) {
            this.setAgentsForCall(data.agents);
        }
    }

    listenCallOutRinging() {
        const vm = this;
        this.ws.on(CALL_OUT_RINGING, (data) => vm.handleCallOutRinging(data));
    }

    handleCallOutRinging() {
        this.setStatus(SOFTPHONE_STATUS.RINGING_OUT);
    }

    listenCallOutAnswered() {
        const vm = this;
        this.ws.on(CALL_OUT_ANSWER_NTF, (data) => vm.handleCallOutAnswered(data));
    }

    handleCallOutAnswered(){
        this.setStatus(SOFTPHONE_STATUS.ANSWERED);
    }

    listenCallOutRemoteSDP() {
        const vm = this;
        this.ws.on(CALL_OUT_REMOTE_SDP, (data) => vm.handleCallOutRemoteSDP(data));
    }

    async handleCallOutRemoteSDP(data) {
        if (!this.currentCall || data?.call_id !== this.currentCall.call_id) {
            return;
        }

        // Nếu PeerConnection đã stable (vd: forAnswer đã hoàn thành offer/answer), bỏ qua
        if (webRTC.peerConnection?.signalingState === 'stable') {
            return;
        }

        this.currentCall.remote_sdp = data;

        if ((data?.sdp_type === CALL_SDP_TYPES.ANSWER || data?.sdp_type === CALL_SDP_TYPES.PRANSWER) && data?.sdp) {
            await webRTC.setRemoteDescription(data.sdp, data?.sdp_type);

            //Nếu có candidate lưu trữ thì thêm vào peer connection
            if (this.currentCall?.remoteCandidate) {
                for (let i = 0; i < this.currentCall?.remoteCandidate.length; i++) {
                    const candidateNtf = this.currentCall.remoteCandidate[i];
                    await webRTC.addIceCandidate(candidateNtf);
                }
                //Xoá candidate đã thêm
                this.currentCall.remoteCandidate = null;
            }
        }
    }

    listenMakeCallResponse() {
        const vm = this;
        this.ws.on(CALL_START_RES, (data) => vm.handleMakeCallResponse(data));
    }

    async handleMakeCallResponse(data) {
        //Sau khi nhận dc res check xem có đúng request_id hiện tại ko
        if (this.currentRequestMakeCallId !== data?.req_id) {
            return;
        }

        //kiểm tra rc != 0 thì báo lỗi
        if (data?.rc !== 0) {
            console.warn('Make call failed:', data?.note);
            this.emitNotification(SOFTPHONE_NOTIFICATION_TYPES.ERROR, data?.rd || 'Lỗi khi thực hiện cuộc gọi');
            this.resetCall();
            return;
        }

        const contact = this.currentCall?.contact;

        this.currentCall = data;
        if (contact && this.currentCall && !this.currentCall.contact) {
            this.currentCall.contact = contact;
        }

        this.currentCall.direction = CALL_DIRECTION.OUTBOUND;

        this.setStatus(SOFTPHONE_STATUS.TRYING);
        const sdp = await webRTC.initCallSession();
        this.sendSDPMakeCall(sdp);
    }

    sendSDPMakeCall(sdp) {
        const data = {
            "cmd": "sdp_req",
            "note": "Gửi sdp lên, trường hợp re-invite",
            "params": {
                "call_id": this.currentCall.call_id,
                "sdp": sdp
            }
        }

        this.ws.send(data);
    }

    handleChangeMicMute(muted) {
        this.emit(SOFTPHONE_EVENTS.MUTE_MIC_STATUS_CHANGED, muted);
        webRTC.muteMicrophone(muted);
    }

    getCurrentMicDeviceId() {
        return this.micDeviceId;
    }

    setCurrentMicDeviceId(micDeviceId) {
        this.micDeviceId = micDeviceId;
    }

    getSDPLocal() {
        return webRTC.peerConnection.localDescription.sdp;
    }

    listenIncomingCall() {
        const vm = this;

        this.ws.on(SOFTPHONE_EVENTS.INCOMING_CALL, (data) => vm.handleIncomingCall(data))
    }

    listenEndCall() {
        const vm = this;

        this.ws.on(SOFTPHONE_EVENTS.CALL_ENDED, () => vm.handleEndCall())
    }

    listenAnsweredOnOtherDevice() {
        const vm = this;

        this.ws.on(SOFTPHONE_EVENTS.ANSWERED_ON_OTHER_DEVICE, () => vm.handleEndCall(false))
    }

    handleEndCall(playEndSound = true) {
        this.emit(SOFTPHONE_EVENTS.MUTE_SOUND_STATUS_CHANGED, false);
        this.emit(SOFTPHONE_EVENTS.MUTE_MIC_STATUS_CHANGED, false);
        this.emit(SOFTPHONE_EVENTS.HOLD_STATUS_CHANGED, false);

        //Nếu đang ở trạng thái idle thì ko cần xử lý gì thêm
        //Trường hợp xảy ra khi cuộc gọi đang không đổ đến agent hiện taij nhưng end thì vẫn có event
        if (this.getStatus() === SOFTPHONE_STATUS.IDLE) {
            return;
        }

        this.endCall(false, playEndSound);
    }

    muteMicrophone(mute = true) {
        webRTC.muteMicrophone(mute);
    }

    async handleIncomingCall(data) {
        if (this.checkReInvite(data)) {
            await this.handleReInvite();

            return;
        }

        this.currentCall = data;
        this.currentCall.direction = CALL_DIRECTION.INBOUND;

        const dataRinging = {
            "cmd": CALL_ANSWER_REQ,
            "note": "Ringing",
            "params": {
                "call_id": this.currentCall?.call_id,
                "code": EVENT_CODES.RINGING,
                "note": "Ringing - đang đổ chuông"
            }
        };

        this.ws.send(dataRinging)

        this.setStatus(SOFTPHONE_STATUS.RINGING);
        this.emit(SOFTPHONE_EVENTS.INCOMING_CALL, data);
    }

    checkReInvite(data) {
        return this.currentCall?.call_id === data.call_id;
    }

    async makeCall(toNumber, contact = null) {
        toNumber = toNumber.trim();

        if (toNumber.length === 0) {
            console.warn('Phone number cannot be empty.');
            return;
        }

        this.emit(SOFTPHONE_EVENTS.SHOW_SOFTPHONE, true);

        if (contact) {
            this.currentCall = {
                contact: contact
            };
        }

        this.currentRequestMakeCallId = crypto.randomUUID();
        this.currentPhoneNumber = toNumber;

        const params = {
            "caller": "0912345678",
            "callee": toNumber,
            "req_id": this.currentRequestMakeCallId,
        };

        const data = {
            "cmd": CALL_START_REQ,
            "params": params
        }

        this.ws.send(data)
    }

    async answerCall() {
        this.setStatus(SOFTPHONE_STATUS.ANSWERED);

        //Kiểm tra nếu this.currentCall.answer = true thì tạo answer
        const forAnswer =
            (this.currentCall?.answer && this.currentCall?.sdp_offer)
                ? this.currentCall?.answer
                : false;

        if (forAnswer) {
            this.currentCall.remote_sdp = this.currentCall.sdp_offer;
        }

        const sdp = await webRTC.initCallSession(forAnswer, this.currentCall.sdp_offer);

        const data = {
            "cmd": CALL_ANSWER_REQ,
            "note": "Answer call",
            "params": {
                "call_id": this.currentCall?.call_id,
                "code": EVENT_CODES.ANSWERED,
                "sdp": sdp,
                "note": "Answer call - cuộc gọi đã được trả lời"
            }
        };

        if (this.currentCall?.ringing_type) {
            data.params.ringing_type = this.currentCall.ringing_type;
        }

        this.ws.send(data)

        return sdp;
    }

    async handleReInvite() {
        const sdp = await webRTC.handleReInvite(this.currentCall.sdp);

        const data = {
            "cmd": CALL_ANSWER_REQ,
            "note": "Answer call",
            "params": {
                "call_id": this.currentCall?.call_id,
                "code": EVENT_CODES.ANSWERED,
                "sdp": sdp,
                "note": "Answer call - cuộc gọi đã được trả lời"
            }
        };
        this.ws.send(data)

        return sdp;
    }

    listenUpdateCallNTF() {
        this.ws.on(UPDATE_CALL_NTF, (data) => this.handleUpdateCall(data));
    }

    async handleUpdateCall(data) {
        if (!this.currentCall || data?.call_id !== this.currentCall.call_id) {
            return;
        }

        if (!data?.answer || !data?.sdp_offer) {
            return;
        }

        const sdpAnswer = await webRTC.handleReInvite(data.sdp_offer);

        this.ws.send({
            "cmd": UPDATE_CALL_RESP,
            "params": {
                "id": data.id,
                "call_id": data.call_id,
                "sdp_answer": sdpAnswer,
            }
        });
    }

    endCall(sendEndReq = true, playEndSound = true) {
        this.emit(SOFTPHONE_EVENTS.REMOTE_MEDIA_STREAM_CHANGED, null);
        webRTC.endCallSession();

        if (sendEndReq) {
            const data = {
                "cmd": CALL_END_REQ,
                "params": {
                    "call_id": this.currentCall?.call_id,
                    "reason": "Agent ended the call"
                }
            }
            this.ws.send(data)
        }

        if (playEndSound) {
            this.emit(SOFTPHONE_EVENTS.PLAY_END_SOUND, true);
        }

        setTimeout(() => {
            this.emit(SOFTPHONE_EVENTS.CALL_ENDED, {call_id: this.currentCall?.call_id});

            this.resetCall();
        }, 1500)

    }

    rejectCall() {
        const payload = {
            cmd: CALL_ANSWER_REQ,
            note: "Từ chối cuộc gọi",
            params: {
                call_id: this.currentCall?.call_id,
                code: EVENT_CODES.REJECTED,
                note: 'Reject/Busy'
            }
        }

        this.ws.send(payload)

        this.emit(SOFTPHONE_EVENTS.REJECTED_CALL, {call_id: this.currentCall?.call_id});
        this.resetCall();
    }

    transferCall(data, req_id = null) {
        if (this.currentCall?.call_id) {
            const payload = {
                cmd: CALL_TRANSFER_REQ,
                note: "Chuyển cuộc gọi",
                params: {
                    call_id: this.currentCall.call_id,
                    ...data
                },
                req_id: req_id
            }

            this.ws.send(payload);
            this.emit(SOFTPHONE_EVENTS.CHANGE_TRANSFER_STATUS, true);
        } else {
            console.warn('No active call to transfer.');
        }
    }

    inviteToCall (data) {
        if (this.currentCall?.call_id) {
            const payload = {
                cmd: CALL_INVITE_REQ,
                note: "Mời thêm người vào cuộc gọi",
                params: {
                    call_id: this.currentCall.call_id,
                    ...data
                }
            }

            this.ws.send(payload);
            this.emit(SOFTPHONE_EVENTS.CHANGE_INVITE_STATUS, true);
        }
    }

    listenInviteResponse() {
        const vm = this;
        this.ws.on(CALL_INVITE_RES, (data) => vm.handleInviteResponse(data));
    }

    handleInviteResponse(data) {
        this.emit(SOFTPHONE_EVENTS.CALL_INVITE_RESP, data);
    }

    listenTransferResponse() {
        const vm = this;
        this.ws.on(CALL_TRANSFER_RES, (data) => vm.handleTransferResponse(data));
    }

    handleTransferResponse(data) {
        this.emit(SOFTPHONE_EVENTS.CALL_TRANSFER_RESP, data);
    }

    listenOnicecandidate(){
        const vm = this;
        webRTC.on(WebRTC.EVENTS_NAME.ON_ICE_CANDIDATE, (e) => vm.handleOnIceCandidate(e));
    }

    listenOntrack() {
        const vm = this;

        webRTC.on(WebRTC.EVENTS_NAME.ON_TRACK, (e) => vm.handleOnTrack(e));
    }

    handleOnTrack(event) {
        this.emit(SOFTPHONE_EVENTS.REMOTE_MEDIA_STREAM_CHANGED, event);
    }

    sendCandidateCompleted() {
        if (this.candidateCompletedSent) {
            return;
        }
        this.candidateCompletedSent = true;
        this.clearCandidateTimeout();

        const data = {
            "cmd": CANDIDATE_COMPLETED_REQ,
            "note": "Gửi candidate hết",
            "params": {
                "call_id": this.currentCall?.call_id,
            }
        }
        this.ws.send(data)
    }

    clearCandidateTimeout() {
        if (this.candidateCompletedTimer) {
            clearTimeout(this.candidateCompletedTimer);
            this.candidateCompletedTimer = null;
        }
    }

    startCandidateTimeout() {
        this.clearCandidateTimeout();
        this.candidateCompletedTimer = setTimeout(() => {
            this.sendCandidateCompleted();
        }, 5000);
    }

    handleOnIceCandidate(event) {
        if (!event) {
            this.sendCandidateCompleted();
            return;
        }

        let candidate = '';
        if (typeof event?.candidate === 'string') {
            candidate = event.candidate;
        } else if (event?.candidate?.candidate) {
            candidate = event.candidate.candidate;
        }

        if (candidate) {
            const data = {
                "cmd": CALL_CANDIDATE_REQ,
                "note": "Gửi candidate",
                "params": {
                    "call_id": this.currentCall?.call_id,
                    "candidate": candidate,
                    "sdp_mline_index": event?.sdpMLineIndex,
                    "sdp_mid": event?.sdpMid
                }
            }

            this.ws.send(data)

            // Reset timeout mỗi lần gửi candidate
            this.startCandidateTimeout();
        }
    }

    offIcecandidate(handler){
        webRTC.off(WebRTC.EVENTS_NAME.ON_ICE_CANDIDATE, handler);
    }

    emitNotification(type, message){
        this.emit(SOFTPHONE_EVENTS.NEW_NOTIFICATION, {
            type: type,
            message: message
        });
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

    emit(event, params) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(params));
        }
    }
}

export default Softphone;