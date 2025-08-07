import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  standalone: true
})
export class Login {


  loginForm: FormGroup;

  // Beautiful geometric pattern (subtle dots)
  backgroundPattern = btoa(`
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="50" cy="20" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="80" cy="20" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="20" cy="50" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="50" cy="50" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="80" cy="50" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="20" cy="80" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="50" cy="80" r="1" fill="rgba(99, 102, 241, 0.1)"/>
      <circle cx="80" cy="80" r="1" fill="rgba(99, 102, 241, 0.1)"/>
    </svg>
  `);

  // Subtle noise texture for header
  noisePattern = btoa(`
    <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" stitchTiles="stitch"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="0.2"/>
    </svg>
  `);

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.router.navigate(['/agents']);
    if (this.loginForm.valid) {
      console.log('Authenticating:', this.loginForm.value);
      // Add your authentication logic here
    }
  }
}
