import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as signalR from '@microsoft/signalr';


interface Message {
  text: string;
  isOutgoing: boolean;
  timestamp: Date;
}

interface Chat {
  id: number;
  username: string;
  unreadCount: number;
  lastMessage: string;
  messages: Message[];
}
@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})

export class App {
  protected readonly title = signal('frontend');
  private hubConnection!: signalR.HubConnection;

  chats: Chat[] = [
    {
      id: 12345,
      username: '@TelegramUser',
      unreadCount: 0,
      lastMessage: 'Esperando mensajes de Telegram...',
      messages: []
    }
  ];

  selectedChat: Chat | null = this.chats[0];
  newMessageText: string = '';

  ngOnInit(): void {
    // Conexión con el Hub de SignalR del backend .NET
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/chat')
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Conectado con éxito al Backend'))
      .catch(err => console.error('Error al conectar con SignalR: ', err));

    // Escuchar evento de mensajes entrantes desde el Webhook de Telegram
    this.hubConnection.on('ReceiveMessage', (data: any) => {
      let chat = this.chats.find(c => c.id === data.chatId);
      
      if (!chat) {
        chat = {
          id: data.chatId,
          username: data.senderName || `@User_${data.chatId}`,
          unreadCount: 0,
          lastMessage: data.text,
          messages: []
        };
        this.chats.push(chat);
      }

      chat.messages.push({
        text: data.text,
        isOutgoing: false,
        timestamp: new Date(data.timestamp)
      });

      chat.lastMessage = data.text;
      if (this.selectedChat?.id !== chat.id) {
        chat.unreadCount++;
      }
    });
  }

  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    chat.unreadCount = 0;
  }

  async sendMessage(): Promise<void> {
    if (!this.newMessageText.trim() || !this.selectedChat) return;

    const textToSend = this.newMessageText;
    const chatId = this.selectedChat.id;

    // Agregar localmente a la vista
    this.selectedChat.messages.push({
      text: textToSend,
      isOutgoing: true,
      timestamp: new Date()
    });
    this.selectedChat.lastMessage = textToSend;
    this.newMessageText = '';

    try {
      // Llamada HTTP al backend para enviar el mensaje a Telegram
      await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text: textToSend })
      });
    } catch (error) {
      console.error('Error enviando mensaje al backend:', error);
    }
  }
}
