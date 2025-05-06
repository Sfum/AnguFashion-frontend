import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderMenuComponent } from './provider-menu.component';

describe('ProviderMenuComponent', () => {
  let component: ProviderMenuComponent;
  let fixture: ComponentFixture<ProviderMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProviderMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
