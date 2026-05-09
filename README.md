# demo-call-b2bua

A Vue 3 reference implementation of a browser-based softphone for a B2BUA
(Back-to-Back User Agent) call architecture. The client speaks WebRTC for
media and a lightweight WebSocket protocol for call signaling, and is
designed to plug into a B2BUA backend that bridges the browser leg to a
PSTN/SIP trunk.

This repository is intended as a demo and a starting point — fork it,
adapt the signaling shape to your backend, and ship.

## Features

- Outbound and inbound calls over WebRTC
- Call control: hold, mute mic, mute speaker, end
- Attended/blind transfer to another agent or to a queue
- Invite (conference) additional participants into an active call
- Browser desktop notifications for incoming calls
- Pluggable TURN/STUN configuration
- Internal/external dial mode
- Auto-reconnecting WebSocket signaling channel

## Tech stack

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vitejs.dev/) build tool
- [Naive UI](https://www.naiveui.com/) component library
- [Pinia](https://pinia.vuejs.org/) state management
- [Vue Router](https://router.vuejs.org/) v4
- [Axios](https://axios-http.com/) HTTP client
- Native WebRTC + WebSocket APIs

## Prerequisites

- Node.js 18+ and npm (or pnpm/yarn)
- A B2BUA backend that exposes the HTTP and WebSocket APIs this client
  expects (see [Backend contract](#backend-contract))
- A TURN server is recommended for cross-NAT calling

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# then edit .env.local with your own values

# 3. Run the dev server
npm run dev
```

The dev server listens on port `8080` with HTTPS enabled (required by the
browser for `getUserMedia`). HTTP and WebSocket requests are proxied to the
backend defined in [`vite.config.js`](./vite.config.js); update the proxy
target to point at your own backend.

### HTTPS in development

Vite is configured to serve over HTTPS using self-signed certificates so
WebRTC can access the microphone. To regenerate certificates locally we
recommend [mkcert](https://github.com/FiloSottile/mkcert):

```bash
mkcert -install
mkcert "*.your-local-domain.test"
```

Then update the `key`/`cert` paths in `vite.config.js`.

## Configuration

All runtime configuration is read from `import.meta.env` (Vite). The
following variables are supported:

| Variable                | Required | Description                                                    |
| ----------------------- | -------- | -------------------------------------------------------------- |
| `VITE_API_URL`          | yes      | Base URL for the HTTP API. Use `/` to proxy via the dev server |
| `VITE_ENV`              | yes      | Environment label (`local`, `staging`, `production`, ...)      |
| `VITE_ROOT_DOMAIN`      | yes      | Root domain used for tenant/workspace resolution               |
| `VITE_TURN_URL`         | no       | TURN server URL                                                |
| `VITE_TURN_USERNAME`    | no       | TURN username                                                  |
| `VITE_TURN_CREDENTIAL`  | no       | TURN credential                                                |

See [`.env.example`](./.env.example) for a starting template.

## Project structure

```
src/
├── components/
│   └── softphone/        # Softphone UI + WebRTC/Softphone handlers
│       ├── handler/      # WebRTC peer connection + call state machine
│       ├── Softphone.vue # Full softphone widget
│       └── ...
├── const/                # API endpoints, socket commands, storage keys
├── helper/               # Small utilities (formatters, contact, workplace)
├── layouts/              # Page layouts
├── pages/
│   ├── b2bua/            # B2BUA demo page
│   └── Login.vue
├── router/               # Vue Router setup + auth guards
├── services/             # HTTP and WebSocket clients
├── stores/               # Pinia stores
└── main.js               # App entry
```

## Backend contract

The client speaks two protocols:

1. **HTTP** for authentication and account/workspace operations. See
   [`src/const/ApiEndpoints.js`](./src/const/ApiEndpoints.js) for the full
   list of endpoints the client calls.
2. **WebSocket** for real-time call signaling. The message commands are
   defined in [`src/const/SocketCMD.js`](./src/const/SocketCMD.js) — for
   example `call_start_req`, `sdp_ntf`, `candidate_ntf`,
   `call_transfer_req`, etc. The full state machine lives in
   [`src/components/softphone/handler/Softphone.js`](./src/components/softphone/handler/Softphone.js).

To integrate with your own B2BUA, implement these endpoints and socket
commands on the server side, or adapt the client to your existing
protocol.

## Build

```bash
npm run build      # produces ./dist
npm run preview    # serves ./dist locally for smoke testing
```

## License

[MIT](./LICENSE) © 2026 Nathan
