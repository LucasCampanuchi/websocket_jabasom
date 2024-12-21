const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: process.env.PORT || 8080 });

let clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total clients: ${clients.size}`);

  // Envia o número total de conexões para todos os clientes
  broadcastConnectionCount();

  // Lida com mensagens recebidas de clientes
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Verifica se a mensagem contém latitude e longitude
      if (data.latitude && data.longitude) {
        console.log(`Received location: ${data.latitude}, ${data.longitude}`);

        // Reenvia a localização para todos os clientes
        broadcastLocation(data.latitude, data.longitude);
      }
    } catch (err) {
      console.error('Invalid message received:', message);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total clients: ${clients.size}`);
    broadcastConnectionCount();
  });
});

// Função para enviar a contagem de conexões para todos os clientes
function broadcastConnectionCount() {
  broadcast({
    type: 'connection_count',
    count: clients.size,
  });
}

// Função para enviar a localização para todos os clientes
function broadcastLocation(latitude, longitude) {
  broadcast({
    type: 'location',
    latitude: latitude,
    longitude: longitude,
  });
}

// Função genérica para enviar mensagens para todos os clientes
function broadcast(message) {
  const messageString = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}

console.log('WebSocket server is running...');
