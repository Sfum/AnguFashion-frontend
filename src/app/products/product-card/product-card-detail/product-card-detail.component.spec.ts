import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCardDetailComponent } from './product-card-detail.component';

describe('ProductCardDetailComponent', () => {
  let component: ProductCardDetailComponent;
  let fixture: ComponentFixture<ProductCardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductCardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
