import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IntentDetailIdComponent } from "../intent-detail-id/intent-detail-id.component";
import { CreateIntentPageComponent } from "../../create-intent/create-intent";
import { IntentDetails } from "../intent-details/intent-details";
import { DialogflowIntent } from '../../../../../interfaces/dialogFlowIntent.interface';

@Component({
  selector: 'app-intent-canvas',
  standalone: true,
  imports: [CommonModule, IntentDetailIdComponent, CreateIntentPageComponent, IntentDetails],
  templateUrl: './intent-canvas.component.html',
  styleUrl: './intent-canvas.component.css'
})
export class IntentCanvasComponent {
  page: string = 'view-intent';
  constructor(public activeOffCanvas: NgbActiveOffcanvas, @Inject('intentData') public intent: DialogflowIntent, private router: Router) { }
  onEditIntent(intent: any) {
    this.page = 'edit-intent';
  }
  onIntentDeleted(event: any) {
    this.activeOffCanvas.dismiss(event);
    this.page = 'create-intent';
  }

  onIntentUpdated(event: any) {
    this.activeOffCanvas.dismiss(event);
    this.page = 'view-intent';
  }
}