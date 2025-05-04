import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTicketComponent } from './product-ticket.component';

describe('ProductTicketComponent', () => {
  let component: ProductTicketComponent;
  let fixture: ComponentFixture<ProductTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTicketComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
