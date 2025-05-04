import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSaleCategoryComponent } from './on-sale-category.component';

describe('OnSaleCategoryComponent', () => {
  let component: OnSaleCategoryComponent;
  let fixture: ComponentFixture<OnSaleCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnSaleCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnSaleCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
