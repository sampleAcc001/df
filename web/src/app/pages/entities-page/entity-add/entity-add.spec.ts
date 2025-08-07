import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityAdd } from './entity-add';

describe('EntityAdd', () => {
  let component: EntityAdd;
  let fixture: ComponentFixture<EntityAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityAdd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntityAdd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
