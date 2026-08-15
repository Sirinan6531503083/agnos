const { WebSocketServer } = require("ws");
const http = require("http");

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
    return;
  }
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ server });

const rooms = new Map();

function joinRoom(sessionId, ws) {
  if (!rooms.has(sessionId)) {
    rooms.set(sessionId, new Set());
  }
  rooms.get(sessionId).add(ws);
}

function leaveRoom(sessionId, ws) {
  const room = rooms.get(sessionId);
  if (!room) return;
  room.delete(ws);
  if (room.size === 0) rooms.delete(sessionId);
}

function broadcastToRoom(sessionId, data, senderWs) {
  const room = rooms.get(sessionId);
  if (!room) return;
  room.forEach((client) => {
    if (client !== senderWs && client.readyState === client.OPEN) {
      client.send(data);
    }
  });
}

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.sessionId = null;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (msg.sessionId && ws.sessionId !== msg.sessionId) {
      if (ws.sessionId) leaveRoom(ws.sessionId, ws);
      ws.sessionId = msg.sessionId;
      joinRoom(msg.sessionId, ws);
    }

    if (ws.sessionId) {
      broadcastToRoom(ws.sessionId, raw.toString(), ws);
    }
  });

  ws.on("close", () => {
    if (ws.sessionId) leaveRoom(ws.sessionId, ws);
  });

  ws.on("error", () => {
    if (ws.sessionId) leaveRoom(ws.sessionId, ws);
  });
});

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      if (ws.sessionId) leaveRoom(ws.sessionId, ws);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => clearInterval(heartbeatInterval));

server.listen(PORT, () => {
  console.log("WebSocket server running on port " + PORT);
});
