import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSaleBrandComponent } from './on-sale-brand.component';

describe('OnSaleBrandComponent', () => {
  let component: OnSaleBrandComponent;
  let fixture: ComponentFixture<OnSaleBrandComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnSaleBrandComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnSaleBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
