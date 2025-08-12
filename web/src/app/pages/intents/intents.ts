import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';



import { DialogflowIntent } from '../../../../interfaces/dialogFlowIntent.interface';
import { DialogFlowService } from '../../services/dialogflow.service';
import Notiflix from 'notiflix';


@Component({
  selector: 'app-intents-list-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterModule,
  ],
  templateUrl: './intents.html',
  styleUrl: './intents.css'
})
export class IntentsListPageComponent implements OnInit {
  addFollowUpIntent(_t30: any) {
    throw new Error('Method not implemented.');
  }
  intents: DialogflowIntent[] = [];

  constructor(private router: Router, private dfService: DialogFlowService) { }

  ngOnInit(): void {
    Notiflix.Loading.circle('Loading Intents...');
    this.dfService.getIntents().subscribe(data =>
      this.intents = this.buildIntentHierarchy(data)
    ).add(
      () => Notiflix.Loading.remove()
    );

  }

  addIntent(): void {
    this.router.navigate(['/intents/create']);
  }

  editIntent(id: string): void {
    this.router.navigate(['/intents/details']);
  }

  getIntentIdFromPath(path: string): string {
    const parts = path.split('/');
    return parts[parts.length - 1];
  }
  expandedIndex: number | null = null;

  toggleAccordion(index: number) {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }
  goToIntent(intent: any) {
    this.router.navigate(['/intents/details', this.getIntentIdFromPath(intent.name)]);
  }


  buildIntentHierarchy(intents: DialogflowIntent[]): DialogflowIntent[] {
    const intentMap: { [id: string]: DialogflowIntent } = {};
    const roots: DialogflowIntent[] = [];

    // Step 1: Add all intents to a map and initialize subIntents
    for (const intent of intents) {
      intent.subIntents = [];
      intentMap[intent.id] = intent;
    }

    // Step 2: Organize into hierarchy
    for (const intent of intents) {
      if (intent.parentId && intentMap[intent.parentId]) {
        intentMap[intent.parentId].subIntents!.push(intent);
      } else {
        roots.push(intent); // Top-level intent (no parent)
      }
    }

    return roots;
  }
  // component.ts
  expandedIntents: Set<string> = new Set();

  toggleExpand(intentId: string): void {
    if (this.expandedIntents.has(intentId)) {
      this.expandedIntents.delete(intentId);
    } else {
      this.expandedIntents.add(intentId);
    }
  }

  isExpanded(intentId: string): boolean {
    return this.expandedIntents.has(intentId);
  }

}





