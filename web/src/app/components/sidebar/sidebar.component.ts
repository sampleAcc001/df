import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogFlowService } from '../../services/dialogflow.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  project: any[] = [];
  constructor(private router: Router, private DialogFlowService: DialogFlowService) { }
  ngOnInit(): void {
    this.DialogFlowService.getProjects().subscribe(
      (data: any) => {
        this.project = data.projects;
        this.DialogFlowService.projectDetails = this.project; // Assuming you want to set the first project as the current project
        console.log('Projects:', this.project);
      }
    );
  }


  // mainNavItems = [
  //   { route: '/agents', icon: 'smart_toy', label: 'Agents' },
  //   { route: '/intents', icon: 'psychology', label: 'Intents' },
  //   { route: '/intents', icon: 'category', label: 'Entities' },
  //   { route: '/graph-view', icon: 'insights', label: 'Analytics' },
  // ];

  mainNavItems = [
    { route: '/agents', label: 'Agents', icon: 'fa-solid fa-robot' },          // Represents AI agent/bots
    { route: '/intents', label: 'Intents', icon: 'fa-solid fa-comments' },     // Conversation/dialog related
    { route: '/entities', label: 'Entities', icon: 'fa-solid fa-database' },   // Data/structured info
    { route: '/graph-view', label: 'Flow', icon: 'fa-solid fa-diagram-project' }, // Visual flow view
    { route: '/settings', label: 'Settings', icon: 'fa-solid fa-gear' },       // General configuration
    { route: '/help', label: 'Help', icon: 'fa-solid fa-circle-question' }     // Help/Documentation
  ];



  activeButton: string | null = null;

  setActiveButton(button: string) {
    this.activeButton = this.activeButton === button ? null : button;
    // Add your click handler logic here
  }
  isActiveRoute(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }

  navigate(route: string) {
    // Your navigation logic here
    this.router.navigate([route]);
  }

  onProjectChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedProjectId = select.value;
    // Handle project change logic
  }
}