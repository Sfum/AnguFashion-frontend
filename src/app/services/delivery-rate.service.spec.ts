import { TestBed } from '@angular/core/testing';

import { DeliveryRateService } from './delivery-rate.service';

describe('DeliveryRateService', () => {
  let service: DeliveryRateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeliveryRateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
