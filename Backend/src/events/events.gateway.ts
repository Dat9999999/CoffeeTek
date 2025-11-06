// src/events/events.gateway.ts
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
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

  // Đây là hàm public để các service khác có thể gọi
  // và phát sự kiện đến TẤT CẢ client
  sendToAll(eventName: string, data: any) {
    this.server.emit(eventName, data);
  }
}