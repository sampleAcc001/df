import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesPage } from './entities-page';

describe('EntitiesPage', () => {
  let component: EntitiesPage;
  let fixture: ComponentFixture<EntitiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntitiesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
