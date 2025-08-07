import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-entity-add',
  templateUrl: './entity-add.html',
  styleUrl: './entity-add.css',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true
})
export class EntityAddComponent implements OnInit {
  entityForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
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
  createEntry(): FormGroup {
    return this.fb.group({
      value: ['', Validators.required],
      synonyms: this.fb.array([this.fb.control('', Validators.required)])
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
