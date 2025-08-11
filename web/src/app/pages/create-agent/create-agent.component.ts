import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-agent',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
  <div class="page-header">
    <div class="header-nav">
      <button class="back-btn" (click)="goBack()">
        <span class="material-icons">arrow_back</span>
      </button>
      <div class="header-content">
        <h1 class="page-title">Create Intent</h1>
        <p class="page-subtitle">Define a new intent for your agent</p>
      </div>
    </div>
  </div>

  <div class="content-wrapper">
    <div class="form-container">
      <form (ngSubmit)="createIntent()" #intentForm="ngForm">
        <!-- Basic Info -->
        <div class="form-section">
          <h2 class="section-title">Basic Information</h2>

          <div class="form-group">
            <label for="displayName">Intent Name *</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              [(ngModel)]="intentData.displayName"
              required
              class="form-control"
              placeholder="e.g., Book Flight"
              maxlength="100" />
          </div>

          <div class="form-group">
            <label for="description">Description</label>
            <textarea
              id="description"
              name="description"
              [(ngModel)]="intentData.description"
              class="form-control"
              placeholder="Optional description for this intent"
              maxlength="300"
              rows="2"></textarea>
          </div>
        </div>

        <!-- Training Phrases -->
        <div class="form-section">
          <h2 class="section-title">Training Phrases</h2>

          <div class="form-group" *ngFor="let phrase of intentData.trainingPhrases; let i = index">
            <input
              type="text"
              class="form-control"
              [(ngModel)]="intentData.trainingPhrases[i]"
              [name]="'phrase' + i"
              placeholder="Type a user phrase"
              required />
            <button type="button" class="icon-btn" (click)="removeTrainingPhrase(i)">
              <span class="material-icons">remove_circle_outline</span>
            </button>
          </div>

          <button type="button" class="btn btn-link" (click)="addTrainingPhrase()">
            <span class="material-icons">add</span>
            Add Phrase
          </button>
        </div>

        <!-- Responses -->
        <div class="form-section">
          <h2 class="section-title">Responses</h2>

          <div class="form-group" *ngFor="let response of intentData.responses; let i = index">
            <textarea
              class="form-control"
              [(ngModel)]="intentData.responses[i]"
              [name]="'response' + i"
              rows="2"
              placeholder="e.g., I can help you book a flight."
              required></textarea>
            <button type="button" class="icon-btn" (click)="removeResponse(i)">
              <span class="material-icons">remove_circle_outline</span>
            </button>
          </div>

          <button type="button" class="btn btn-link" (click)="addResponse()">
            <span class="material-icons">add</span>
            Add Response
          </button>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="!intentForm.form.valid || isSaving">
            <span class="material-icons" *ngIf="isSaving">hourglass_empty</span>
            {{ isSaving ? 'Saving...' : 'Create Intent' }}
          </button>
        </div>
      </form>
    </div>

    <div class="info-panel">
      <div class="info-card">
        <div class="info-header">
          <span class="material-icons">lightbulb</span>
          <h3>Tips</h3>
        </div>
        <div class="info-content">
          <ul>
            <li>Add multiple variations of user phrases</li>
            <li>Use simple, natural language</li>
            <li>Keep responses short and informative</li>
          </ul>
        </div>
      </div>

      <div class="info-card">
        <div class="info-header">
          <span class="material-icons">help_outline</span>
          <h3>Need Help?</h3>
        </div>
        <div class="info-content">
          <ul>
            <li><a href="#" class="info-link">Intent Design Guide</a></li>
            <li><a href="#" class="info-link">Training Tips</a></li>
            <li><a href="#" class="info-link">Dialogflow Docs</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

  `,
  styles: [`
    .page-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .page-header {
      background: white;
      border-bottom: 1px solid #dadce0;
      padding: 24px 32px;
    }

    .header-nav {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .back-btn {
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

    .back-btn:hover {
      background-color: #f8f9fa;
    }

    .header-content h1 {
      font-size: 28px;
      font-weight: 400;
      color: #202124;
      margin: 0 0 4px 0;
    }

    .page-subtitle {
      color: #5f6368;
      font-size: 14px;
      margin: 0;
    }

    .content-wrapper {
      flex: 1;
      display: flex;
      gap: 32px;
      padding: 32px;
      overflow-y: auto;
    }

    .form-container {
      flex: 2;
      max-width: 600px;
    }

    .form-section {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      padding: 24px;
      margin-bottom: 24px;
    }

    .section-title {
      font-size: 18px;
      font-weight: 500;
      color: #202124;
      margin: 0 0 24px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e8eaed;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .form-group label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #202124;
      margin-bottom: 8px;
    }

    .form-control {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #dadce0;
      border-radius: 4px;
      font-size: 14px;
      font-family: 'Roboto', sans-serif;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }

    .form-control:invalid {
      border-color: #ea4335;
    }

    .form-hint {
      color: #5f6368;
      font-size: 12px;
      margin-top: 4px;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-group input[type="checkbox"] {
      margin: 0;
    }

    .checkbox-label {
      margin: 0 !important;
      cursor: pointer;
    }

    .form-range {
      width: 100%;
      margin: 8px 0;
    }

    .range-value {
      text-align: center;
      font-weight: 500;
      color: #1976d2;
      margin-top: 4px;
    }

    .advanced-toggle {
      margin-bottom: 32px;
    }

    .toggle-btn {
      background: none;
      border: none;
      color: #1976d2;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }

    .toggle-btn:hover {
      background-color: #f8f9fa;
    }

    .form-actions {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      padding: 24px;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    .info-panel {
      flex: 1;
      max-width: 320px;
    }

    .info-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
      padding: 24px;
      margin-bottom: 24px;
    }

    .info-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }

    .info-header .material-icons {
      color: #1976d2;
      font-size: 20px;
    }

    .info-header h3 {
      font-size: 16px;
      font-weight: 500;
      color: #202124;
      margin: 0;
    }

    .info-content p {
      color: #5f6368;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 12px 0;
    }

    .info-content ul {
      margin: 0;
      padding-left: 20px;
    }

    .info-content li {
      color: #5f6368;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 4px;
    }

    .info-link {
      color: #1976d2;
      text-decoration: none;
    }

    .info-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 1024px) {
      .content-wrapper {
        flex-direction: column;
      }
      
      .info-panel {
        max-width: none;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 16px;
      }
      
      .content-wrapper {
        padding: 16px;
        gap: 16px;
      }
      
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column-reverse;
      }
      
      .form-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class CreateAgentComponent {
  isSaving: any;
  addResponse() {
    throw new Error('Method not implemented.');
  }
  removeResponse(_t53: number) {
    throw new Error('Method not implemented.');
  }
  addTrainingPhrase() {
    throw new Error('Method not implemented.');
  }
  removeTrainingPhrase(_t37: number) {
    throw new Error('Method not implemented.');
  }
  intentData: any;
  createIntent() {
    throw new Error('Method not implemented.');
  }
  showAdvanced = false;
  isCreating = false;

  agentData = {
    displayName: '',
    description: '',
    defaultLanguage: 'en',
    timeZone: 'America/New_York',
    projectId: '',
    enableLogging: true,
    matchMode: 'MATCH_MODE_HYBRID',
    classificationThreshold: 0.3,
    enableSpellCheck: true
  };

  constructor(private router: Router) { }

  goBack() {
    this.router.navigate(['/agents']);
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  createAgent() {
    this.isCreating = true;

    // Simulate API call
    setTimeout(() => {
      console.log('Creating agent with data:', this.agentData);
      this.isCreating = false;
      this.router.navigate(['/agents']);
    }, 2000);
  }
}