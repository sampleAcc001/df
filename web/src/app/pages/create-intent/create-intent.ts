import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DialogFlowService } from '../../services/dialogflow.service';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-create-intent-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './create-intent.html',
  styleUrl: './create-intent.css'
})
export class CreateIntentPageComponent implements OnInit {
  isSaving: boolean = false;
  searchText: string = '';
  intentForm!: FormGroup;

  @Output() intentCreated = new EventEmitter<any>();
  @Output() dataDismissed = new EventEmitter<any>();
  @Input() isModal!: boolean;
  @Input() OpeningFromGraph!: boolean;
  intents = [

  ];

  constructor(private fb: FormBuilder, private router: Router, private dfService: DialogFlowService) { }

  ngOnInit(): void {
    this.intentForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      trainingPhrases: this.fb.array([]),
      responses: this.fb.array([])
    });
  }

  get trainingPhrases(): FormArray {
    return this.intentForm.get('trainingPhrases') as FormArray;
  }

  get responses(): FormArray {
    return this.intentForm.get('responses') as FormArray;
  }

  addTrainingPhrase() {
    this.trainingPhrases.push(
      this.fb.group({ text: ['', Validators.required] })
    );
  }

  addResponse() {
    this.responses.push(
      this.fb.group({ text: ['', Validators.required] })
    );
  }

  removeTrainingPhrase(index: number) {
    this.trainingPhrases.removeAt(index);
  }


  removeResponse(index: number) {
    this.responses.removeAt(index);
  }

  createIntent() {
    if (this.intentForm.invalid) return;

    const raw = this.intentForm.value;
    const intentData = {
      displayName: raw.name,
      trainingPhrases: raw.trainingPhrases.map((p: any) => p.text),
      messages: raw.responses.map((r: any) => r.text)
    };
    this.dfService.createIntent(intentData).subscribe(
      response => {
        console.log('Intent created:', response);
        this.intentCreated.emit('intentCreated');
        Notiflix.Notify.success('Intent created successfully!');
        this.isModal ? this.router.navigate(['/graph-view']) : this.router.navigate(['/intents']);
      },
      error => {
        console.error('Error creating intent:', error);
        Notiflix.Notify.failure('Failed to create intent. Please try again.');
      }
    );
  }



  goBack() {
    this.isModal ? this.dataDismissed.emit('dataDismissed') : this.router.navigate(['/intents']);

  }

  goToCreateIntent() {
    this.router.navigate(['/intents/create']);
  }

  goToIntentDetails(intent: any) {
    this.router.navigate(['/intents', intent.displayName]);
  }

}
