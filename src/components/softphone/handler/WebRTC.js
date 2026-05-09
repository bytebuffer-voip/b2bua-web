import {config} from "../../../../config/index.js";

class WebRTC {
    EVENTS_NAME = {
        ON_TRACK: 'ontrack',
        ON_ICE_CANDIDATE: 'onicecandidate',

    };
    static EVENTS_NAME = {
        ON_TRACK: 'ontrack',
        ON_ICE_CANDIDATE: 'onicecandidate',

    };

    constructor() {
        this.descriptionType = {
            OFFER: 'offer',
            ANSWER: 'answer',
        };
        this.configuration = {
            iceServers: config.iceServers,
        };
        this.eventHandlers = {};

        this.peerConnection = null;
        this.localStream = null;
        this.remoteStream = null;
    }

    setRemoteDescription(sdp, type) {
        if (!this.peerConnection) {
            console.error('setRemoteDescription: peerConnection is not initialized.');
            return Promise.resolve('peerConnection is not initialized.');
        }

        const remoteDesc = new RTCSessionDescription({
            type: type,
            sdp: sdp
        });

        return this.peerConnection.setRemoteDescription(remoteDesc)
            .catch(err => {
                console.error('Failed to set remote description:', err);
            });
    }

    async initCallSession(forAnswer = false, sdp = null) {
        this.peerConnection = new RTCPeerConnection(this.configuration);
        this.logICEConnectionState();

        this.listenEvent();
        await this.startLocalStream();

        if (forAnswer) {
            await this.createAnswer(sdp);
        } else {
            await this.createOffer();
        }

        return this.peerConnection.localDescription.sdp;
    }

    addIceCandidate(candidateNtf) {
        const iceCandidate = new RTCIceCandidate({
            candidate: candidateNtf.candidate,
            sdpMid: candidateNtf.sdpMid || "0",
            sdpMLineIndex: candidateNtf.sdpMLineIndex || 0
        });
        return this.peerConnection.addIceCandidate(iceCandidate)
            .catch(err => {
                console.error('Failed to add ICE candidate:', err);
            });
    }


    logICEConnectionState() {
        this.peerConnection.oniceconnectionstatechange = () => {
            if (this.peerConnection.iceConnectionState === 'failed') {
                console.error('ICE connection failed.');
            }
        };
    }

    async handleReInvite(sdp) {
        await this.createAnswer(sdp);
        return this.peerConnection.localDescription.sdp;
    }

    listenEvent() {
        this.peerConnection.ontrack = (event) => {
            if (!this.remoteStream) {
                this.remoteStream = new MediaStream();
            }
            this.remoteStream.addTrack(event.track);
            this.emit(WebRTC.EVENTS_NAME.ON_TRACK, this.remoteStream);
        };

        this.peerConnection.onicecandidate = (event) => {
            this.emit(WebRTC.EVENTS_NAME.ON_ICE_CANDIDATE, event.candidate);
        }
    }

    endCallSession() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => {
                track.stop();
            });
            this.localStream = null;
        }

        if (this.remoteStream) {
            this.remoteStream.getTracks().forEach(track => {
                track.stop();
            });
            this.remoteStream = null;
        }

        if (this.peerConnection) {
            this.peerConnection.ontrack = null;
            this.peerConnection.onicecandidate = null;
            this.peerConnection.onconnectionstatechange = null;
            this.peerConnection.close();
            this.peerConnection = null;
        }
    }

    muteMicrophone(muted) {
        if (this.localStream) {
            this.localStream.getAudioTracks().forEach(track => {
                track.enabled = !muted;
            });
        }
    }

    async startLocalStream(constraints = { video: false, audio: true }) {
        try {
            this.localStream = await navigator.mediaDevices.getUserMedia(constraints);

            this.localStream.getTracks().forEach(track => {
                this.peerConnection.addTrack(track, this.localStream);
            });


        } catch (error) {
            console.error('Failed to access media devices:', error);
            throw error;
        }
    }

    async createOffer() {
        const offer = await this.peerConnection.createOffer();
        await this.peerConnection.setLocalDescription(offer);
    }

    async createAnswer(sdp) {
        // Server SDP có thể chứa a=setup:actpass — chỉ hợp lệ cho offer gốc.
        // Khi dùng làm remote offer cho phía answerer, cần đổi thành 'active'.
        const sanitizedSdp = sdp.replace(/a=setup:actpass/g, 'a=setup:active');

        await this.setRemoteDescription(sanitizedSdp, this.descriptionType.OFFER);

        const answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer)
            .catch(error => {
                console.error('Failed to set local description for answer:', error);
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

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(handler => handler(data));
        }
    }
}

export default new WebRTC();