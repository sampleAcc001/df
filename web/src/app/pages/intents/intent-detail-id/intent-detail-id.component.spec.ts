import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntentDetailIdComponent } from './intent-detail-id.component';

describe('IntentDetailIdComponent', () => {
  let component: IntentDetailIdComponent;
  let fixture: ComponentFixture<IntentDetailIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntentDetailIdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IntentDetailIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
