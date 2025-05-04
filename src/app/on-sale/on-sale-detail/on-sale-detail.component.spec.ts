import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnSaleDetailComponent } from './on-sale-detail.component';

describe('OnSaleDetailComponent', () => {
  let component: OnSaleDetailComponent;
  let fixture: ComponentFixture<OnSaleDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnSaleDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OnSaleDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
