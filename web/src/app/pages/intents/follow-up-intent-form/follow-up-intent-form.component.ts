import { Dialog } from '@angular/cdk/dialog';
import { Component, Input, OnInit } from '@angular/core';
import { DialogflowIntent } from '../../../../../interfaces/dialogFlowIntent.interface';

@Component({
  selector: 'app-follow-up-intent-form',
  standalone: true,
  imports: [],
  templateUrl: './follow-up-intent-form.component.html',
  styleUrl: './follow-up-intent-form.component.css'
})
export class FollowUpIntentFormComponent implements OnInit {
  @Input({ required: true }) intent!: DialogflowIntent;
  constructor() { }
  ngOnInit(): void {
    console.log(this.intent);

  }

}
