import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


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
  chats: Chat[] = [
    {
      id: 12345,
      username: '@JuanPerez',
      unreadCount: 1,
      lastMessage: 'Hola, necesito ayuda con una consulta.',
      messages: [
        { text: 'Hola, necesito ayuda con una consulta.', isOutgoing: false, timestamp: new Date() }
      ]
    }
  ];

  selectedChat: Chat | null = this.chats[0];
  newMessageText: string = '';

  selectChat(chat: Chat): void {
    this.selectedChat = chat;
    chat.unreadCount = 0; // Marcar como leído
  }

  sendMessage(): void {
    if (!this.newMessageText.trim() || !this.selectedChat) return;

    this.selectedChat.messages.push({
      text: this.newMessageText,
      isOutgoing: true,
      timestamp: new Date()
    });

    this.selectedChat.lastMessage = this.newMessageText;
    this.newMessageText = '';
  }
}
