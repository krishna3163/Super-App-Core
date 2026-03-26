import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5003';

class SocketService {
  private socket: Socket | null = null;

  connect(userData: any) {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to Socket.io');
      this.socket?.emit('setup', userData);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io');
    });

    return this.socket;
  }

  getSocket() {
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChat(chatId: string) {
    this.socket?.emit('join chat', chatId);
  }

  sendMessage(message: any) {
    this.socket?.emit('new message', message);
  }

  emitTyping(chatId: string) {
    this.socket?.emit('typing', chatId);
  }

  emitStopTyping(chatId: string) {
    this.socket?.emit('stop typing', chatId);
  }

  // Calling features
  emitCallUser(data: any) {
    this.socket?.emit('call_user', data);
  }

  emitAnswerCall(data: any) {
    this.socket?.emit('answer_call', data);
  }

  emitEndCall(data: any) {
    this.socket?.emit('end_call', data);
  }
}

export const socketService = new SocketService();
