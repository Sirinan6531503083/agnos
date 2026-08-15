#!/usr/bin/env node

// Simple WebSocket broadcast server for Agnos real-time sync
// Usage: `node ws-server.js` or `npm run ws` (script already in package.json)

const WebSocket = require('ws');

const PORT = process.env.WS_PORT || 8080;

const wss = new WebSocket.Server({ port: PORT });

function broadcast(data, sender) {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== sender) {
      client.send(str);
    }
  });
}

wss.on('connection', (ws, req) => {
  console.log('WS connected', req.socket.remoteAddress || 'unknown');

  ws.on('message', (msg) => {
    // Expect incoming JSON messages from clients (SyncMessage). We attach a server timestamp
    try {
      const parsed = JSON.parse(msg.toString());
      parsed.timestamp = new Date().toISOString();
      // Broadcast to other clients
      broadcast(parsed, ws);
    } catch (err) {
      // Non-JSON: just broadcast raw
      broadcast(msg, ws);
    }
  });

  ws.on('close', () => console.log('WS disconnected'));
  ws.on('error', (err) => console.error('WS error', err && err.message));
});

console.log(`WebSocket server running on ws://0.0.0.0:${PORT}`);
