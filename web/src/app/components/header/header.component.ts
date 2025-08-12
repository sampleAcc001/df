import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
   <header class="d-flex align-items-center justify-content-between px-4 border-bottom shadow-sm bg-white" style="height: 64px;">

  <!-- Left Section -->
  <div class="d-flex align-items-center gap-3">
    <div class="d-flex align-items-center gap-2 logo-container" (click)="navigateToHome()">
      <i class="fa-solid fa-comments text-primary fs-3"></i>
      <span class="fs-5 fw-normal text-secondary">Dialogflow</span>
    </div>
  </div>

  <!-- Right Section -->
  <div class="d-flex align-items-center gap-2">
    <button class="btn btn-light btn-sm rounded-circle" title="Help">
      <i class="fa-regular fa-circle-question"></i>
    </button>
    <button class="btn btn-light btn-sm rounded-circle" title="Settings">
      <i class="fa-solid fa-gear"></i>
    </button>
    <button class="btn btn-light btn-sm rounded-circle" title="Notifications">
      <i class="fa-regular fa-bell"></i>
    </button>
    <div class="ms-2 text-secondary fs-3" role="button">
      <i class="fa-solid fa-circle-user"></i>
    </div>
  </div>
</header>

  `,
  styles: [`
    .logo-container {
      cursor: pointer;
      padding: 6px 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    .logo-container:hover {
      background-color: #f8f9fa;
    }
  `]
})
export class HeaderComponent {
  constructor(private router: Router) { }

  navigateToHome() {
    this.router.navigate(['/agents']);
  }
}
