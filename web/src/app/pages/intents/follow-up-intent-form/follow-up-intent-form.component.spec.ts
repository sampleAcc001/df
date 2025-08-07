import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUpIntentFormComponent } from './follow-up-intent-form.component';

describe('FollowUpIntentFormComponent', () => {
  let component: FollowUpIntentFormComponent;
  let fixture: ComponentFixture<FollowUpIntentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUpIntentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowUpIntentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
