import { io, Socket } from 'socket.io-client';

// Singleton socket instance to prevent duplicate connections
let socketInstance: Socket | null = null;

export function getSocketInstance(): Socket {
    if (!socketInstance) {
        socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL as string, {
            transports: ['websocket'],
            reconnection: true,
        });
    }
    return socketInstance;
}

export function disconnectSocket(): void {
    if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
    }
}

