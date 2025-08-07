import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogFlowService } from '../../services/dialogflow.service';
import Notiflix from 'notiflix';
import { CommonService } from '../../services/common.service';
import { AgentConfig } from '../../../../interfaces/agent.interface';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.html',
  styleUrls: ['./chat-widget.css']
})
export class ChatWidgetComponent implements AfterViewInit, OnDestroy, OnInit {

  isOpen = false;
  messages: any[] = [];
  newMessage = '';
  AgentInfo!: AgentConfig;
  @ViewChild('messageContainer') messageContainer!: ElementRef;

  constructor(private dfService: DialogFlowService, private common: CommonService) { }
  ngOnInit(): void {
    this.dfService.getAgents().subscribe((data: any) => {
      this.AgentInfo = data;
    })
  }
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
    this.dfService.sendMessageToAgent(message, this.common.userId).subscribe({
      next: (response) => {
        this.messages.push({ sender: 'bot', text: response?.response || 'No response from bot.' });
        console.log('Bot response:', response);
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
