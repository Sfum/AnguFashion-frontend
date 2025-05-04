import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoBarComponent } from './logo-bar.component';

describe('LogoBarComponent', () => {
  let component: LogoBarComponent;
  let fixture: ComponentFixture<LogoBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoBarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LogoBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
