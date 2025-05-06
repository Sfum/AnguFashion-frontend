import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryRateComponent } from './delivery-rate.component';

describe('DeliveryRateComponent', () => {
  let component: DeliveryRateComponent;
  let fixture: ComponentFixture<DeliveryRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryRateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeliveryRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
