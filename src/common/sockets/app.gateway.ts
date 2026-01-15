import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;

    afterInit(server: Server) { console.log('WebSocket Initialized'); }

    handleConnection(client: Socket) {
        const userId = client.handshake.query.userId;
        if (userId) {
            client.join(`user_${userId}`);
            console.log(`User connected: ${userId}`);
        }
    }

    handleDisconnect(client: Socket) { console.log(`Disconnected: ${client.id}`); }

    sendToUser(userId: string, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, data);
    }

    broadcast(event: string, data: any) { this.server.emit(event, data); }
}
