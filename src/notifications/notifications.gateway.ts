
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationsGateway {
    @WebSocketServer() server: Server;

    sendNotification(userId: string, notification: any) {
        this.server.to(`user_${userId}`).emit('notification', notification);
    }
}
