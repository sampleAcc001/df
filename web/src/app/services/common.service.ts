import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DialogFlowService } from './dialogflow.service';
import { DialogflowIntent } from '../../../interfaces/dialogFlowIntent.interface';
import { EntitiesPage } from '../pages/entities-page/entities-page';
import { AgentConfig } from '../../../interfaces/agent.interface';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  Intents: DialogflowIntent[] = [];
  Entities: EntitiesPage[] = [];
  Agents: AgentConfig[] = [];

  userId: string = 'user-123'; //dummy user id for now
  constructor(
    private modalService: NgbModal,
    private dfService: DialogFlowService
  ) { }



  InitializeIntents() {
    this.dfService.getIntents().subscribe({
      next: (data) => {
        this.Intents = this.buildIntentHierarchy(data);
        console.log('Intents:', this.Intents);
      },
      error: (error) => {
        console.error('Error fetching intents:', error);
      }
    })

  }
  InnitializeAgents() { }
  InitializeEntities() { }




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

  //open custom modal
  open(content: any, data?: any, key: string = ''): Promise<any> {
    const modalRef = this.modalService.open(content, {
      size: 'xl',
      centered: true,
      scrollable: true,
    });

    if (data && key) {
      modalRef.componentInstance[key] = data;
    }

    return modalRef.result;
  }
}
