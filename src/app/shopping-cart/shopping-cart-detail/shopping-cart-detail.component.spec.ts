import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShoppingCartDetailComponent } from './shopping-cart-detail.component';

describe('ShoppingCartDetailComponent', () => {
  let component: ShoppingCartDetailComponent;
  let fixture: ComponentFixture<ShoppingCartDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShoppingCartDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
