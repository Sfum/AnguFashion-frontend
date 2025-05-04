import { TestBed } from '@angular/core/testing';

import { VatServiceService } from './vat-service.service';

describe('VatServiceService', () => {
  let service: VatServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VatServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
