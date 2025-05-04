import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SizeLabelFilterComponent } from './size-label-filter.component';

describe('SizeLabelFilterComponent', () => {
  let component: SizeLabelFilterComponent;
  let fixture: ComponentFixture<SizeLabelFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SizeLabelFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SizeLabelFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
