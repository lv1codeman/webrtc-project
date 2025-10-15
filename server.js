// server.js
const WebSocket = require("ws");

// 設定 WebSocket 伺服器運行在 3000 埠
const wss = new WebSocket.Server({ port: 3000 });

console.log("信令伺服器已啟動，監聽埠: 3000");
const clients = new Map(); // 用來儲存連線的客戶端

wss.on("connection", function connection(ws) {
  // 每個連線都是一個獨特的用戶（Peer）
  const id = Date.now(); // 簡單地用時間戳當作 ID
  clients.set(ws, id);
  console.log(`新用戶連線，ID: ${id}`);

  ws.on("message", function incoming(message) {
    console.log(`收到來自用戶 ${id} 的訊息: ${message}`);

    // WebRTC 信令通常是 JSON 格式
    let parsedMessage;
    try {
      parsedMessage = JSON.parse(message);
    } catch (e) {
      console.error("無法解析 JSON 訊息:", message);
      return;
    }

    // 信令伺服器的核心工作：將訊息轉發給目標用戶
    // 這裡我們實作一個最簡單的「廣播」模式（實際應用中您會需要指定目標用戶）
    wss.clients.forEach(function each(client) {
      // 不將訊息發送回發送者本身
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        // 將收到的信號訊息轉發給其他所有連線的客戶端
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    clients.delete(ws);
    console.log(`用戶 ${id} 已離線。`);
  });

  // 提示客戶端連線成功
  ws.send(JSON.stringify({ type: "connected", id: id }));
});
