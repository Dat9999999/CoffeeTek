// src/events/events.gateway.ts
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
    origin: '*', // Cho phép tất cả (giống main.ts). Trong production, hãy đổi thành domain frontend
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    console.log(`Socket Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Socket Client disconnected: ${client.id}`);
  }

  // 1. Client cần join vào room riêng của mình để nhận thông báo cá nhân
  @SubscribeMessage('join_room')
  handleJoinRoom(client: Socket, userId: number | string) {
    if (userId) {
      const roomName = `user_${userId}`;
      client.join(roomName);
      console.log(`Client ${client.id} joined room: ${roomName}`);
    }
  }

  // 2. Gửi cho MỘT user cụ thể
  sendToUser(userId: number, eventName: string, data: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit(eventName, data);
  }

  // 3. Gửi cho TẤT CẢ user
  sendToAll(eventName: string, data: any) {
    this.server.emit(eventName, data);
  }
}