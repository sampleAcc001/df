import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntentDetailModalComponent } from './intent-detail-modal.component';

describe('IntentDetailModalComponent', () => {
  let component: IntentDetailModalComponent;
  let fixture: ComponentFixture<IntentDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntentDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntentDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
