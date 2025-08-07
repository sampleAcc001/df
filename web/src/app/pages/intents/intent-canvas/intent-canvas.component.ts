import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intent-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intent-canvas.component.html',
  styleUrl: './intent-canvas.component.css'
})
export class IntentCanvasComponent {

  constructor(public activeOffCanvas: NgbActiveOffcanvas, @Inject('intentData') public intent: any, private router: Router) { }
  onEditIntent(intent: any) {
    this.activeOffCanvas.dismiss();
    this.router.navigate(['/intents/details', intent.id]);
  }
}