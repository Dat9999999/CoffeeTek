// src/events/events.gateway.ts
import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Allows all origins (change in production)
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(EventsGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`🔌 Socket Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`🔌 Socket Client disconnected: ${client.id}`);
  }

  // 1. Client cần join vào room riêng của mình để nhận thông báo cá nhân
  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, userId: number | string) {
    if (userId) {
      const roomName = `user_${userId}`;
      client.join(roomName);
      this.logger.log(`👤 Client ${client.id} joined room: ${roomName}`);
    } else {
      this.logger.warn(`⚠️  Client ${client.id} attempted to join room without userId`);
    }
  }

  // 2. Gửi cho MỘT user cụ thể
  sendToUser(userId: number, eventName: string, data: any) {
    try {
      const roomName = `user_${userId}`;
      const connectedClients = this.server.sockets.adapter.rooms.get(roomName);
      const clientCount = connectedClients ? connectedClients.size : 0;
      
      this.logger.log(`📤 Sending event '${eventName}' to user ${userId} (room: ${roomName}, ${clientCount} client(s) connected)`);
      
      this.server.to(roomName).emit(eventName, data);
      
      this.logger.log(`✅ Successfully sent event '${eventName}' to user ${userId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send event '${eventName}' to user ${userId}`, error);
      throw error;
    }
  }

  // 3. Gửi cho TẤT CẢ user
  sendToAll(eventName: string, data: any) {
    try {
      const connectedClients = this.server.sockets.sockets.size;
      
      this.logger.log(`📢 Broadcasting event '${eventName}' to all clients (${connectedClients} connected client(s))`);
      
      // Log order-specific details for better debugging
      if (eventName === 'newOrder' && data?.id) {
        this.logger.log(`   └─ Order ID: ${data.id}, Status: ${data.status}, Customer: ${data.customerPhone || 'N/A'}`);
      } else if (eventName === 'processOrderCount') {
        this.logger.log(`   └─ Process Order Count: ${data}`);
      }
      
      this.server.emit(eventName, data);
      
      this.logger.log(`✅ Successfully broadcasted event '${eventName}' to ${connectedClients} client(s)`);
    } catch (error) {
      this.logger.error(`❌ Failed to broadcast event '${eventName}'`, error);
      throw error;
    }
  }
}