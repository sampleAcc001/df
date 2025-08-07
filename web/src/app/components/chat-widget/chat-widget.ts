import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogFlowService } from '../../services/dialogflow.service';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})
export class ChatWidgetComponent implements AfterViewInit, OnDestroy {

  isOpen = false;
  messages: any[] = [

  ];
  newMessage = '';
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(private DialogFlowService: DialogFlowService) { }
  ngOnDestroy(): void {
    // Cleanup if necessary
    this.messages = [];
    this.newMessage = '';
  }
  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const container = this.messageContainer?.nativeElement;
      container.scrollTop = container.scrollHeight;
    }, 0);
  }
  // Initialize with a welcome message

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {
    const message = this.newMessage.trim();

    if (!message) return;

    // Push the user's message to the chat
    this.messages.push({ sender: 'user', text: message });
    this.scrollToBottom();

    // Clear input field
    this.newMessage = '';

    // Send message to backend via DialogFlowService
    this.DialogFlowService.sendMessageToAgent(message).subscribe({
      next: (response) => {
        this.messages.push({ sender: 'bot', text: response?.response || 'No response from bot.' });
      },
      error: (err) => {
        console.error('Error sending message:', err);
        this.messages.push({ sender: 'bot', text: 'Sorry, something went wrong. Please try again.' });
      }
    }).add(() => {
      this.scrollToBottom();
    });
  }

}
