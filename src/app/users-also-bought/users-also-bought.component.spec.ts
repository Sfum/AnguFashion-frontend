import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAlsoBoughtComponent } from './users-also-bought.component';

describe('UsersAlsoBoughtComponent', () => {
  let component: UsersAlsoBoughtComponent;
  let fixture: ComponentFixture<UsersAlsoBoughtComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersAlsoBoughtComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsersAlsoBoughtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
