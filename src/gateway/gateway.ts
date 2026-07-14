import { OnModuleInit } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class MyGateway implements OnModuleInit{

  @WebSocketServer() // Decorator to inject the WebSocket server instance
  server: Server; // we need it to give messages back to the client

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
    });
  }

  @SubscribeMessage('event')
  onEvent(@MessageBody() data: any) {
    console.log('Received event with data:', data);
    this.server.emit('res', { message: 'Response from server',
      data: data
     }); // Send a response back to the client
  }
}
