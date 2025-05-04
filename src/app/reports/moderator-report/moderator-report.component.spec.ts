import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModeratorReportComponent } from './moderator-report.component';

describe('ModeratorReportComponent', () => {
  let component: ModeratorReportComponent;
  let fixture: ComponentFixture<ModeratorReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeratorReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
