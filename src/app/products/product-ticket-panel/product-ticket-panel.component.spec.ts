import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTicketPanelComponent } from './product-ticket-panel.component';

describe('ProductTicketPanelComponent', () => {
  let component: ProductTicketPanelComponent;
  let fixture: ComponentFixture<ProductTicketPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTicketPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductTicketPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
