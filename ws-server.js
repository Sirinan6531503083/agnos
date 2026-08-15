const { WebSocketServer } = require("ws");

const PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`🚀 Agnos WebSocket Server running on wss://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("🔌 New client connected");

  ws.on("message", (message) => {
    try {
      // Decode the raw message
      const dataStr = message.toString();
      const parsedData = JSON.parse(dataStr);
      
      console.log(`📩 Received: [Type: ${parsedData.type}] [Session: ${parsedData.sessionId || "Global"}]`);

      // Broadcast the message to all other connected clients
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(dataStr);
        }
      });
    } catch (err) {
      console.error("❌ Failed to process message:", err);
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("⚠️ Socket error:", error);
  });
});
