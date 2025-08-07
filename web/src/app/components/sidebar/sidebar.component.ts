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


  mainNavItems = [
    { route: '/agents', icon: 'smart_toy', label: 'Agents' },
    { route: '/intents', icon: 'psychology', label: 'Intents' },
    { route: '/entities', icon: 'category', label: 'Entities' },
    { route: '/graph-view', icon: 'insights', label: 'Analytics' },
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