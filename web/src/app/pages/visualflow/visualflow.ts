import { Component, inject, Injector, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vflow, NodeChange, Node, Edge, ConnectionSettings, Connection } from 'ngx-vflow';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogFlowService } from '../../services/dialogflow.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import Notiflix from 'notiflix';
import { NgbModal, NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { IntentDetailModalComponent } from '../intents/intent-detail-modal/intent-detail-modal.component';
import { IntentCreateModalComponent } from '../create-intent/intent-create-modal/intent-create-modal.component';
import { IntentCanvasComponent } from '../intents/intent-canvas/intent-canvas.component';
import { DialogflowIntent } from '../../../../interfaces/dialogFlowIntent.interface';


@Component({
  selector: 'app-visualflow',
  standalone: true,
  imports: [CommonModule, FormsModule, Vflow, ReactiveFormsModule, MatDialogModule],
  templateUrl: './visualflow.html',
  styleUrl: './visualflow.css'
})
export class VisualFlowComponent implements OnInit {
  lastUpdated!: string | number | Date;

  constructor(private fb: FormBuilder, private dfService: DialogFlowService, private modalService: NgbModal, private offcanvasService: NgbOffcanvas) { }

  nodes: Node[] = [];
  edges: Edge[] = [

  ];
  counter = 0;

  selectedNode: Node | null = null;
  selectedEdge: Edge | null = null;

  editLabel = '';
  showIntentModal = false;
  intentForm!: FormGroup;
  isSaving = false;

  intents: DialogflowIntent[] = [];
  offcanvasRef?: NgbOffcanvasRef;

  dotsBackgroundConfig = {
    type: 'dots',
    size: 2,
    spacing: 20,
    color: '#ccc'
  } as const; // "as const" for type inference

  backgroundColor = '#000';

  readonly dialog = inject(MatDialog);
  ngOnInit(): void {
    this.LoadIntents();
  }
  LoadIntents() {
    Notiflix.Loading.circle('Loading Intents...');
    this.dfService.getIntents().subscribe(data => {
      this.createNodesFromIntents(data);
    }).add(
      () => Notiflix.Loading.remove()
    );
  }
  public connectionSettings: ConnectionSettings = {
    curve: 'smooth-step',
  };
  public createEdge(connection: Connection) {
    this.edges = [
      ...this.edges,
      {
        ...connection,
        id: `${connection.source} -> ${connection.target}`,
        markers: {
          start: {
            type: 'arrow-closed',
          },
          end: {
            type: 'arrow',
          },
        },
        curve: 'smooth-step',
      },
    ];
  }
  createNodesFromIntents(intents: any[]) {
    const nodeMap = new Map<string, any>();
    const positioned = new Set<string>();
    const positionTracker = new Map<number, number>();
    this.intents = intents;

    this.nodes = [];
    this.edges = [];

    const spacingX = 240;
    const spacingY = 100;
    const rootX = 100;
    const rootY = 100;

    intents.forEach(intent => nodeMap.set(intent.id, intent));

    const welcomeIntent = intents.find(i => i.displayName.includes('Default Welcome Intent'));
    const fallbackIntent = intents.find(i => i.displayName.includes('Default Fallback Intent'));

    const placeIntentTree = (intent: any, level: number) => {
      const siblingsAtLevel = positionTracker.get(level) || 0;
      const x = rootX + level * spacingX;
      const y = rootY + siblingsAtLevel * spacingY;
      this.nodes.push(this.buildNode(intent.id, intent.displayName, x, y, intent.isFallback));
      positioned.add(intent.id);
      positionTracker.set(level, siblingsAtLevel + 1);

      const children = intents.filter(i => i.parentId === intent.id);
      children.forEach(child => {
        // Avoid outgoing edge from fallback intent
        if (intent.id !== fallbackIntent?.id) {
          this.edges.push({
            id: `edge-${intent.id}-${child.id}`,
            source: intent.id,
            target: child.id,
            curve: 'smooth-step'
          });
        }
        placeIntentTree(child, level + 1);
      });
    };

    if (welcomeIntent) {
      placeIntentTree(welcomeIntent, 0);
    }

    const rootIntents = intents.filter(i => !i.parentId && i !== welcomeIntent && i !== fallbackIntent);
    rootIntents.forEach(intent => {
      if (!positioned.has(intent.id)) {
        placeIntentTree(intent, 1);
        if (welcomeIntent) {
          this.edges.push({
            id: `edge-${welcomeIntent.id}-${intent.id}`,
            source: welcomeIntent.id,
            target: intent.id,
            curve: 'smooth-step'
          });
        }
      }
    });

    if (fallbackIntent) {
      const maxX = Math.max(...this.nodes.map(n => n.point.x)) + spacingX;
      const y = rootY;
      this.nodes.push(this.buildNode(fallbackIntent.id, fallbackIntent.displayName, maxX, y, fallbackIntent.isFallback));
      this.nodes.forEach(n => {
        if (n.id !== fallbackIntent.id && n.id !== welcomeIntent?.id) {
          this.edges.push({
            id: `edge-${n.id}-${fallbackIntent.id}`,
            source: n.id,
            target: fallbackIntent.id,
            curve: 'smooth-step'
          });
        }
      });
    }
  }

  buildNode(id: string, label: string, x: number, y: number, isFallback: boolean = false): Node {
    return {
      id,
      type: 'default',
      point: { x, y },
      width: isFallback ? 200 : 160,
      height: isFallback ? 80 : 60,
      text: label
    };
  }

  addIntent() {
    this.OpenCustomModal(IntentCreateModalComponent);
  }

  OpenCustomModal(content: any, data?: any) {
    const modalRef = this.modalService.open(content, {
      size: 'xl', centered: true,
      scrollable: true,
    });
    if (data) {
      modalRef.componentInstance.intentdata = data;
    }
    modalRef.result.then((result) => {
      console.log(`Closed with: ${result}`);
      if (result === 'intentDeleted' || result === 'intentUpdated') {
        this.LoadIntents();
        this.createNodesFromIntents(result);
      }
    }, (reason) => {
      console.log(`Dismissed ${reason}`);
    });
  }

  deleteIntent(id: string) {
    this.nodes = this.nodes.filter(n => n.id !== id);
    this.edges = this.edges.filter(e => e.source !== id && e.target !== id);
  }

  onEdgeConnect(event: { source: string; target: string }) {
    const id = `edge-${event.source}-${event.target}`;
    const newEdge: Edge = { id, source: event.source, target: event.target };
    this.edges = [...this.edges, newEdge];
  }

  deleteEdge(edgeId: string) {
    this.edges = this.edges.filter(e => e.id !== edgeId);
  }

  async onNodesChangeHandler(changes: NodeChange[]) {
    for (const change of changes) {
      if (change.type === 'select' && change.selected === true) {
        const node = this.nodes.find(n => n.id === change.id);
        if (!node) return;

        const intentData = this.intents.find(i => i.id === node.id);

        // Dismiss previous offcanvas if it exists
        if (this.offcanvasRef) {
          await this.offcanvasRef.dismiss();
          this.offcanvasRef = undefined; // clear the reference
        }

        // Create custom injector with intent data
        const injector = Injector.create({
          providers: [{ provide: 'intentData', useValue: intentData }],
          parent: this.offcanvasService['_injector'] // fallback if needed
        });

        // Open new offcanvas and store the reference
        this.offcanvasRef = this.offcanvasService.open(IntentCanvasComponent, {
          position: 'end',
          backdrop: false,
          scroll: true,
          panelClass: 'w-full sm:max-w-md shadow-lg',
          injector: injector,
        });

        // Optionally handle close/dismiss events
        this.offcanvasRef.result.finally(() => {
          this.offcanvasRef = undefined;
        });
      }
    }
  }


  saveChanges() {
    if (!this.selectedNode) return;

    const updatedNode = {
      ...this.selectedNode,
      text: this.editLabel
    };
    this.nodes = this.nodes.map(n => (n.id === updatedNode.id ? updatedNode : n));

    this.closeModal();
  }

  closeModal() {
    this.selectedNode = null;
    this.showIntentModal = false;
  }

  selectEdge(edge: Edge) {
    this.selectedEdge = edge;
  }

  confirmDeleteEdge() {
    if (this.selectedEdge) {
      this.deleteEdge(this.selectedEdge.id);
      this.selectedEdge = null;
    }
  }

  cancelDeleteEdge() {
    this.selectedEdge = null;
  }

  deleteIntents() {
    if (this.selectedNode) {
      this.deleteIntent(this.selectedNode.id);
      this.closeModal();
    }
  }
  resetView() {
    // Recreate nodes with original positions
    this.createNodesFromIntents([...this.intents]);

    // Clear selections
    this.selectedNode = null;
    this.selectedEdge = null;

    // User feedback
    Notiflix.Notify.info('Flow reset to initial state', {
      position: 'right-top',
      timeout: 1500,
      fontSize: '14px'
    });
  }
}
