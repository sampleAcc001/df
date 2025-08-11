import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intent-detail-id',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intent-detail-id.component.html',
  styleUrl: './intent-detail-id.component.css'
})
export class IntentDetailIdComponent {
  @Input() intent: any
  @Output() onEditIntent = new EventEmitter<any>();
  constructor(public activeOffCanvas: NgbActiveOffcanvas, private router: Router) { }
  EditIntent(intent: any) {
    // this.activeOffCanvas.dismiss();
    // this.router.navigate(['/intents/details', intent.id]);
    this.onEditIntent.emit('edit-intent');
  }
}
