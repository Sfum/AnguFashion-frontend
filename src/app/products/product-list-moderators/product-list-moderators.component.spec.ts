import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListModeratorsComponent } from './product-list-moderators.component';

describe('ProductListModeratorsComponent', () => {
  let component: ProductListModeratorsComponent;
  let fixture: ComponentFixture<ProductListModeratorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListModeratorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductListModeratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
