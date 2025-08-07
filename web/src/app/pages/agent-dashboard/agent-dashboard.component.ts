import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { DialogFlowService } from '../../services/dialogflow.service';
import Notiflix from 'notiflix';

interface Intent {
  id: string;
  name: string;
  trainingPhrases: number;
  responses: number;
  lastModified: string;
}

interface Entity {
  id: string;
  name: string;
  entries: number;
  lastModified: string;
}

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css'
})
export class AgentDashboardComponent implements OnInit {
  trainingStatus = {
    status: 'ready',
    label: 'Ready',
    message: 'Your agent is trained and ready to use.',
    progress: 100
  };

  agentData: any;
  intentsList: any[] = [];
  entitiesList: any[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private dialogflowService: DialogFlowService
  ) { }

  ngOnInit() {
    // In a real app, you would fetch agent data based on the ID
    this.loadDialogflowData();
  }

  loadDialogflowData() {
    Notiflix.Loading.circle('Loading Agent Data...');

    forkJoin({
      agent: this.dialogflowService.getAgents(),
      intents: this.dialogflowService.getIntents(),
      entities: this.dialogflowService.getEntities()
    }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: ({ agent, intents, entities }) => {
        this.agentData = agent;
        this.intentsList = intents;
        this.entitiesList = entities;
      },
      complete: () => Notiflix.Loading.remove(),
      error: (err) => console.error('Loading failed', err)
    });
  }
  navigateToIntents() {
    // Navigate to intents page (would be implemented)
    console.log('Navigate to intents');
    this.router.navigate(['/intents', 'create']);
  }

  navigateToEntities() {
    // Navigate to entities page (would be implemented)
    console.log('Navigate to entities');
    this.router.navigate(['/entity', 'add']);
  }

  openTestConsole() {
    // Open test console (would be implemented)
    console.log('Open test console');
  }

  viewAnalytics() {
    // Navigate to analytics (would be implemented)
    console.log('View analytics');
    this.router.navigate(['/graph-view']);
  }

  getTotalTrainingPhrases(): number {
    return this.intentsList.reduce((total, intent) => total + intent.trainingPhrases, 0);
  }

  getTotalEntityEntries(): number {
    return this.entitiesList.reduce((total, entity) => total + entity.entries, 0);
  }

  isNewAgent(): boolean {
    return this.intentsList.length <= 2 && this.entitiesList.length <= 1;
  }
}