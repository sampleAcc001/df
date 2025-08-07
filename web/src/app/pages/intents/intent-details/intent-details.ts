import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogFlowService } from '../../../services/dialogflow.service';
import { CommonModule } from '@angular/common';
import Notiflix from 'notiflix';
import { ChatWidgetComponent } from "../../../components/chat-widget/chat-widget";
import { CommonService } from '../../../services/common.service';
import { FollowUpIntentFormComponent } from '../follow-up-intent-form/follow-up-intent-form.component';

@Component({
  selector: 'app-intent-details',
  templateUrl: './intent-details.html',
  styleUrls: ['./intent-details.css'],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ChatWidgetComponent
  ],
  standalone: true
})
export class IntentDetails implements OnInit {
  intentForm!: FormGroup;
  isSaving = false;
  intentId!: string;
  intent: any;
  @Input() intentData: any;

  @Output() intentUpdated = new EventEmitter<any>();
  @Output() intentDeleted = new EventEmitter<any>();
  @Output() dataDismissed = new EventEmitter<any>();
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dfService: DialogFlowService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.activatedRoute.snapshot.paramMap.get('id')! ? this.intentId = this.activatedRoute.snapshot.paramMap.get('id')! : this.intentId = this.intentData;
    console.log('Intent ID:', this.intentId);
    this.buildForm();
    this.loadIntent();
  }

  buildForm(): void {
    this.intentForm = this.fb.group({
      displayName: ['', Validators.required],
      description: [''],
      trainingPhrases: this.fb.array([]),
      responses: this.fb.array([])
    });
  }


  loadIntent(): void {
    Notiflix.Loading.circle('Loading Intent Details...');

    this.dfService.getIntentById(this.intentId).subscribe(intent => {
      if (!intent) {
        Notiflix.Notify.failure('Intent not found');
        this.router.navigate(['/intents']);
        return;
      }

      this.intent = intent;

      this.intentForm.patchValue({
        displayName: intent.displayName,
        description: intent.description || ''
      });

      // Clear existing phrases/responses in form arrays
      this.trainingPhrases.clear();
      this.responses.clear();

      // Add Training Phrases
      if (Array.isArray(intent.trainingPhrases)) {
        intent.trainingPhrases.forEach((phrase: string) => {
          this.addTrainingPhrase(phrase);
        });
      }

      // Add Responses
      if (Array.isArray(intent.responses)) {
        intent.responses.forEach((text: string) => {
          this.addResponse(text);
        });
      }

      Notiflix.Loading.remove();
    }, err => {
      console.error('Error loading intent:', err);
      Notiflix.Loading.remove();
      // Notiflix.Notify.failure('Failed to load intent details');
    });
  }

  get trainingPhrases(): FormArray {
    return this.intentForm.get('trainingPhrases') as FormArray;
  }

  get responses(): FormArray {
    return this.intentForm.get('responses') as FormArray;
  }

  addTrainingPhrase(text: string = ''): void {
    this.trainingPhrases.push(this.fb.group({ text: [text] }));
  }

  addResponse(text: string = ''): void {
    this.responses.push(this.fb.group({ text: [text] }));
  }

  removeTrainingPhrase(index: number): void {
    this.trainingPhrases.removeAt(index);
  }

  removeResponse(index: number): void {
    this.responses.removeAt(index);
  }


  updateIntent(): void {
    // Early exit if form is invalid
    if (this.intentForm.invalid) return;

    this.isSaving = true;

    const formValue = this.intentForm.value;

    // Prepare the updated intent object to match Dialogflow's API schema
    const updatedIntent = {
      intentId: this.dfService.getConcatenatedIntentId(this.intentId),
      displayName: formValue.displayName,

      trainingPhrases: formValue.trainingPhrases.map((tp: any) => tp.text),
      messages: formValue.responses.map((r: any) => r.text)
    };

    // Call the service to update the intent
    this.dfService.updateIntent(updatedIntent).subscribe({
      next: () => {
        this.isSaving = false;
        if (this.intentData) {
          this.intentUpdated.emit('intentUpdated');
          return;
        }
        this.router.navigate(['/intents']);
      },
      error: () => {
        this.isSaving = false;
        alert('Failed to update intent');
      }
    });
  }

  goBack(): void {
    this.intentData ? this.dataDismissed.emit('dataDismissed') : window.history.back();
  }

  deleteIntent(): void {
    Notiflix.Confirm.show(
      'Delete Intent',
      'Are you sure you want to delete this intent?',
      'Yes',
      'No',
      () => {
        const id = `projects/${this.dfService.projectDetails[0].projectId}/agent/intents/${this.intentId}`;
        this.dfService.deleteIntent(id).subscribe({
          next: () => {
            Notiflix.Notify.success('Intent deleted successfully!');
            if (this.intentData) {
              this.intentDeleted.emit('intentDeleted');
              return;
            }
            this.router.navigate(['/intents']);
          },
          error: () => {
            Notiflix.Notify.failure('Failed to delete intent. Please try again.');
          }
        });
      },
      () => {
        Notiflix.Notify.info('Intent deletion canceled.');
      }
    );
  }

  openFollowupIntentModal(): void {
    this.commonService.open(FollowUpIntentFormComponent, this.intent)
      .then(res => {
        console.log(res);
      })
      .catch(err => console.log(err));
  }

  showFollowupDropdown = false;
  dropdownStyles = {};

  followupCategories = ['yes', 'no', 'cancel', 'repeat', 'fallback', 'custom',];

  toggleFollowupDropdown(triggerBtn: HTMLElement) {
    this.showFollowupDropdown = !this.showFollowupDropdown;

    if (this.showFollowupDropdown) {
      const rect = triggerBtn.getBoundingClientRect();
      this.dropdownStyles = {
        left: `${rect.left}px`,
        bottom: `${window.innerHeight - rect.top + 8}px` // 8px margin above button
      };
    }
  }

  addFollowupIntent(category: string) {
    this.showFollowupDropdown = false;
    // Handle follow-up intent logic here
    console.log('Adding follow-up intent for category:', category);
    this.dfService.addFollowUpIntent(category, this.intent).subscribe({
      next: () => {
        this.intentUpdated.emit('intentUpdated');
        Notiflix.Notify.success('Follow-up intent added successfully!');
        this.loadIntent();
        // this.router.navigate(['/intents']);
      },
      error: () => {
        this.dataDismissed.emit('dataDismissed');
        Notiflix.Notify.failure('Failed to add follow-up intent. Please try again.');
      }
    });
  }



}
