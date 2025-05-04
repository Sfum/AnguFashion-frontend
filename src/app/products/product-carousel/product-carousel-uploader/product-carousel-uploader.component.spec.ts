import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductCarouselUploaderComponent } from './product-carousel-uploader.component';

describe('ProductCarouselUploaderComponent', () => {
  let component: ProductCarouselUploaderComponent;
  let fixture: ComponentFixture<ProductCarouselUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCarouselUploaderComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductCarouselUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
