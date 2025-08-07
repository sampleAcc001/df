import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-left">
        <div class="logo-container" (click)="navigateToHome()">
          <span class="material-icons logo-icon">chat</span>
          <span class="logo-text">Dialogflow</span>
        </div>
        <!-- <div class="breadcrumb">
          <span class="breadcrumb-item">Console</span>
        </div> -->
      </div>
      
      <div class="header-right">
        <button class="header-btn" title="Help">
          <span class="material-icons">help_outline</span>
        </button>
        <button class="header-btn" title="Settings">
          <span class="material-icons">settings</span>
        </button>
        <button class="header-btn" title="Notifications">
          <span class="material-icons">notifications</span>
        </button>
        <div class="user-avatar">
          <span class="material-icons">account_circle</span>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      border-bottom: 1px solid #dadce0;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .logo-container:hover {
      background-color: #f8f9fa;
    }

    .logo-icon {
      color: #1976d2;
      font-size: 28px;
    }

    .logo-text {
      font-size: 20px;
      font-weight: 400;
      color: #5f6368;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
    }

    .breadcrumb-item {
      color: #5f6368;
      font-size: 14px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-btn {
      background: none;
      border: none;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      color: #5f6368;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s ease;
    }

    .header-btn:hover {
      background-color: #f8f9fa;
    }

    .user-avatar {
      margin-left: 8px;
      color: #5f6368;
      cursor: pointer;
    }

    .user-avatar .material-icons {
      font-size: 32px;
    }

    @media (max-width: 768px) {
      .header {
        padding: 0 16px;
      }
      
      .breadcrumb {
        display: none;
      }
      
      .header-btn {
        display: none;
      }
      
      .header-btn:last-of-type {
        display: flex;
      }
    }
  `]
})
export class HeaderComponent {
  constructor(private router: Router) { }

  navigateToHome() {
    this.router.navigate(['/agents']);
  }
}