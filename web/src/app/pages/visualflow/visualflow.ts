import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vflow, NodeChange, Node, Edge } from 'ngx-vflow';
import { FormBuilder, FormGroup, FormArray, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogFlowService } from '../../services/dialogflow.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import Notiflix from 'notiflix';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IntentDetailModalComponent } from '../intents/intent-detail-modal/intent-detail-modal.component';
import { IntentCreateModalComponent } from '../create-intent/intent-create-modal/intent-create-modal.component';
import { HeaderNavComponent } from "../../components/header-nav/header-nav.component"; // Check the correct import path


@Component({
  selector: 'app-visualflow',
  standalone: true,
  imports: [CommonModule, FormsModule, Vflow, ReactiveFormsModule, MatDialogModule, HeaderNavComponent],
  templateUrl: './visualflow.html',
  styleUrl: './visualflow.css'
})
export class Visualflow implements OnInit {
  constructor(private fb: FormBuilder, private dfService: DialogFlowService, private modalService: NgbModal) { }

  nodes: Node[] = [];
  edges: Edge[] = [];
  counter = 0;

  selectedNode: Node | null = null;
  selectedEdge: Edge | null = null;

  editLabel = '';
  showIntentModal = false;
  intentForm!: FormGroup;
  isSaving = false;

  dotsBackgroundConfig = {
    type: 'dots',
    size: 2,
    spacing: 20,
    color: '#ccc'
  } as const; // "as const" for type inference
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

  createNodesFromIntents(intents: any[]) {
    const nodeMap = new Map<string, any>();
    const positioned = new Set<string>();
    const positionTracker = new Map<number, number>();

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
            target: child.id
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
            target: intent.id
          });
        }
      }
    });

    if (fallbackIntent) {
      const maxX = Math.max(...this.nodes.map(n => n.point.x)) + spacingX;
      const y = rootY;
      this.nodes.push(this.buildNode(fallbackIntent.id, fallbackIntent.displayName, maxX, y, fallbackIntent.isFallback));
      this.nodes.forEach(n => {
        // Avoid incoming edge to welcome intent or fallback intent itself
        if (n.id !== fallbackIntent.id && n.id !== welcomeIntent?.id) {
          this.edges.push({
            id: `edge-${n.id}-${fallbackIntent.id}`,
            source: n.id,
            target: fallbackIntent.id
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
      width: 140,
      height: 60,
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

    // 🔥 Pass the data here!
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

  onNodesChangeHandler(changes: NodeChange[]) {
    for (const change of changes) {
      if (change.type === 'select' && change.selected === true) {
        const node = this.nodes.find(n => n.id === change.id);
        if (node) {
          this.OpenCustomModal(IntentDetailModalComponent, change.id) // ✅ open modal only on actual click
        }
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
}
