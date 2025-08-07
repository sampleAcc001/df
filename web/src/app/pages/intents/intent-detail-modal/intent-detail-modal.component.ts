import { Component, Input, OnInit } from '@angular/core';
import { IntentDetails } from "../intent-details/intent-details";
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-intent-detail-modal',
  standalone: true,
  imports: [IntentDetails, CommonModule],
  templateUrl: './intent-detail-modal.component.html',
  styleUrl: './intent-detail-modal.component.css'
})
export class IntentDetailModalComponent implements OnInit {
  @Input() intentdata: any;
  constructor(public modal: NgbActiveModal) { }
  ngOnInit(): void {
    console.log(this.intentdata);

  }


}
