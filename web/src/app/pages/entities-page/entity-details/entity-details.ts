import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogFlowService } from '../../../services/dialogflow.service';
import Notiflix from 'notiflix';

@Component({
  selector: 'app-entity-add',
  templateUrl: './entity-details.html',
  styleUrl: './entity-details.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class EntityDetailsComponent implements OnInit {
  entityForm!: FormGroup;
  entityId: string = '';
  constructor(private fb: FormBuilder, private router: Router, private activatedRoute: ActivatedRoute, private dfService: DialogFlowService) { }

  ngOnInit(): void {
    this.entityId = this.activatedRoute.snapshot.paramMap.get('id')!;
    this.fetchAndPathEntityDetail(this.entityId);
    //from dfservice 

    this.entityForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      type: ['Map', Validators.required],
      entries: this.fb.array([this.createEntry()])
    });
  }

  get entries(): FormArray {
    return this.entityForm.get('entries') as FormArray;
  }

  getSynonyms(entry: AbstractControl): FormArray<FormControl> {
    return entry.get('synonyms') as FormArray<FormControl>;
  }

  fetchAndPathEntityDetail(id: string) {
    // When fetching data
    Notiflix.Loading.circle('Loading Entity...');
    this.dfService.getEntityById(this.entityId).subscribe({
      next: (response) => {
        Notiflix.Loading.remove();
        this.patchEntityForm(response);
        // If you need the original Dialogflow ID
        // this.currentEntityId = response.name.split('/').pop();
      },
      error: (err) => console.error('Failed to load entity', err)
    });
    Notiflix.Loading.remove();
  }
  patchEntityForm(entityData: {
    displayName: string;
    kind: 'KIND_MAP' | 'KIND_LIST' | 'KIND_REGEXP';
    entities: Array<{ value: string; synonyms: string[] }>
  }) {
    while (this.entries.length) {
      this.entries.removeAt(0);
    }

    const typeMap: Record<'KIND_MAP' | 'KIND_LIST' | 'KIND_REGEXP', string> = {
      'KIND_MAP': 'Map',
      'KIND_LIST': 'List',
      'KIND_REGEXP': 'Regexp'
    };

    const formType = typeMap[entityData.kind] || 'Map';

    this.entityForm.patchValue({
      name: entityData.displayName,
      type: formType,
      description: ''
    });

    // Add entries
    entityData.entities.forEach(entry => {
      this.entries.push(this.createEntry(entry.value, entry.synonyms));
    });
  }

  createEntry(value: string = '', synonyms: string[] = []): FormGroup {
    return this.fb.group({
      value: [value, Validators.required],
      synonyms: this.fb.array(synonyms.map(s => this.fb.control(s)))
    });
  }

  addEntry(): void {
    this.entries.push(this.createEntry());
  }

  removeEntry(index: number): void {
    this.entries.removeAt(index);
  }

  addSynonym(entryIndex: number): void {
    const synonyms = this.entries.at(entryIndex).get('synonyms') as FormArray;
    synonyms.push(this.fb.control('', Validators.required));
  }

  removeSynonym(entryIndex: number, synonymIndex: number): void {
    const synonyms = this.entries.at(entryIndex).get('synonyms') as FormArray;
    synonyms.removeAt(synonymIndex);
  }

  onSubmit(): void {

    console.log(this.entityForm.value);

  }
  cancel(): void {
    // Logic to handle cancellation, e.g., navigate back or reset the form
    this.router.navigate(['/entities']);
  }
}
interface EntityForm {
  name: string;
  description: string;
  type: string;
  entries: FormArray<FormGroup<{
    value: FormControl<string>;
    synonyms: FormArray<FormControl<string>>;
  }>>;
}