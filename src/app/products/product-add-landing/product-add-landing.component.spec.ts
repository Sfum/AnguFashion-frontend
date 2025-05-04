import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductAddLandingComponent } from './product-add-landing.component';

describe('ProductAddLandingComponent', () => {
  let component: ProductAddLandingComponent;
  let fixture: ComponentFixture<ProductAddLandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAddLandingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductAddLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
