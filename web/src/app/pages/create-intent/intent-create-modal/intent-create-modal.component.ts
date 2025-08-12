import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CreateIntentPageComponent } from "../create-intent";

@Component({
  selector: 'app-intent-create-modal',
  standalone: true,
  imports: [CommonModule, CreateIntentPageComponent],
  templateUrl: './intent-create-modal.component.html',
  styleUrl: './intent-create-modal.component.css'
})
export class IntentCreateModalComponent implements OnInit {
  @Input() intentdata: any;
  isModal: boolean = true;
  // @Input({ required: true }) IsModal!: boolean;
  constructor(public modal: NgbActiveModal) { }
  ngOnInit(): void {
    console.log(this.intentdata);
  }
  onIntentCreated(intent: any) {
    this.modal.close(intent);
  }
  closeModal() {
    this.modal.dismiss();
  }

}
