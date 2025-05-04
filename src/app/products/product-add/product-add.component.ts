import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { debounceTime, finalize, take } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-product-add',
  templateUrl: './product-add.component.html',
  styleUrls: ['./product-add.component.sass'],
})
export class ProductAddComponent implements OnInit {
  private onSubmitSubject = new Subject<void>();
  productForm: FormGroup;
  productId: string | undefined;
  uploadedImages: string[] = [];
  isLoading: boolean = false;
  brands$ = this.productService.brands$;
  categories$ = this.productService.categories$;
  availableColors$: Observable<string[]> | undefined;
  selectedImageIndex: number | null = null;
  availableColors = 'assets/colors/colors.json';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private afs: AngularFirestore,
    private router: Router,
    private afStorage: AngularFireStorage,
    private authService: AuthService,
    private http: HttpClient,
    private snackbarService: SnackbarService,
  ) {
    this.productForm = this.fb.group({
      product_name: [''],
      product_title: [''],
      product_description: [''],
      categoryId: [''],
      product_image: [[]],
      in_bundle: [false],
      price: [''],
      quantityStock: [''],
      sizes: this.fb.array([
        this.createSize()
      ]),
      colors: [''],
      material: [''],
      unitType: [''],

  });


    this.onSubmitSubject.pipe(debounceTime(1000)).subscribe(() => {
      this.onSubmit();
    });
  }

// Helper method to create a size form group with validation for numeric fields
  createSize(): FormGroup {
    return this.fb.group({
      id: [this.generateUniqueId()],
      size: ['0', [Validators.required, Validators.pattern(/^\d+$/)]], // Ensure it's a string
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      unitType: ['size', Validators.required],
      sizeLabel: [''],
    });
  }


  ngOnInit(): void {
    // Generate a unique product ID
    this.productId = this.afs.createId();

    // Fetch available colors from the local JSON file
    this.http.get<{ name: string; variations: string[] }[]>(this.availableColors).subscribe(
      (colors) => {
        const colorVariations = colors.flatMap((color) =>
          color.variations.map((variation) => `${color.name} - ${variation}`)
        );
        this.availableColors$ = new Observable((observer) => {
          observer.next(colorVariations);
          observer.complete();
        });
      },
      (error) => {
        console.error('Error fetching colors:', error);
      }
    );
  }

  //Getter for sizes FormArray from the reactive form
  get sizes(): FormArray {
    return (this.productForm.get('sizes') as FormArray) ?? this.fb.array([]);
  }


  addSize(): void {
    this.sizes.push(this.createSize());
  }


  //Removes a size from the FormArray at the specified index
  removeSize(index: number): void {
    if (this.sizes.length > 1) {
      this.sizes.removeAt(index);
    }
  }

  // Method to trigger form submission with debounce
  onSubmitWithDebounce(): void {
    if (this.productForm.invalid || this.uploadedImages.length === 0) {
      console.log('Images are still uploading or form is invalid.');
      return;  // Prevent submission if the form is invalid or images are not uploaded
    }
    this.onSubmitSubject.next();  // Trigger submission after debounce
  }

  uploadImages(event: any): void {
    const files = event.target.files as FileList;
    const totalFiles = files.length;
    let uploadedCount = 0;

    if (totalFiles > 0) {
      const newUploadedImages: string[] = [...this.uploadedImages];

      Array.from(files).forEach((file: File) => {
        const filePath = `products/${this.productId}/${file.name}`;
        const fileRef = this.afStorage.ref(filePath);
        const task = this.afStorage.upload(filePath, file);

        task.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(
              (url) => {
                newUploadedImages.push(url);
                this.uploadedImages = newUploadedImages;

                this.productForm.patchValue({
                  product_image: this.uploadedImages,
                });

                uploadedCount++;

                if (uploadedCount === totalFiles) {
                  this.onSubmitWithDebounce();
                }
              },
              (error) => {
                console.error('Error getting download URL:', error);
              },
            );
          }),
        ).subscribe(
          (snapshot) => {
            console.log('Upload progress:', snapshot);
          },
          (error) => {
            console.error('Upload error:', error);
          },
        );
      });
    } else {
      console.error('No files selected');
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      console.log('Form is invalid. Please fill in all required fields.');
      return;
    }

    this.authService.user$.pipe(take(1)).subscribe((user) => {
      if (!user) {
        console.log('No user logged in.');
        return;
      }

      const formValue = this.productForm.value;

      // Validate sizes array
      const sizes = Array.isArray(formValue.sizes) ? formValue.sizes : [];

      // Sanitize sizes
      const sanitizedSizes = this.sanitizeSizes(sizes);

      const sanitizedProduct = {
        ...formValue,
        sizes: sanitizedSizes, // Replace with sanitized sizes
      };

      const productData = {
        ...this.productForm.value,
        uploaderId: user.uid,
        product_image: this.uploadedImages,
        colors: this.formatInput(this.productForm.get('colors')?.value),
        sizes: this.formatInput(this.productForm.get('sizes')?.value),
      };

      // Subscribe to addProduct Observable instead of using .then()
      this.productService.addProduct(productData, user.uid).subscribe(
        () => {
          // Success handling
          this.snackbarService.showSnackbar('Product added successfully!');
          this.productForm.reset();
          this.uploadedImages = [];
          this.router.navigate(['/manage-products']);
        },
        (error) => {
          // Error handling
          console.error('Error adding product:', error);
          this.snackbarService.showSnackbar(error.message || 'Failed to add product. Please try again.');
        }
      );
    });
  }

  // Helper method to format input values for colors and sizes
  private formatInput(value: any): any {
    if (typeof value === 'string') {
      return value.split(',').map((item: string) => item.trim());
    }
    return value || [];
  }

  // Generate a unique ID for ProductSize entries
  private generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9); // Simple unique ID generator
  }

  optionBrandSelected(selectedBrandId: number): void {
    this.productService.optionBrandSelected(selectedBrandId);
  }

  optionCategorySelected(selectedCategoryId: number): void {
    this.productService.optionCategorySelected(selectedCategoryId);
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  deleteImage(index: number): void {
    if (this.uploadedImages && index > -1 && index < this.uploadedImages.length) {
      this.uploadedImages.splice(index, 1);
      this.productForm.patchValue({
        product_image: this.uploadedImages,
      });

      if (this.selectedImageIndex !== null) {
        if (this.selectedImageIndex === index) {
          this.selectedImageIndex = null;
        } else if (this.selectedImageIndex > index) {
          this.selectedImageIndex--;
        }
      }
    }
  }

  private sanitizeSizes(sizes: any[]): any[] {
    return sizes.map((size) => ({
      id: size?.id || null, // Ensure ID is preserved
      size: Number(size?.size) || 0, // Convert size to a number
      quantity: Number(size?.quantity) || 0, // Convert quantity to a number
      price: Number(size?.price || '0'), // Ensure price is a float
      salePrice: Number(size?.salePrice || '0'), // Include sale price if applicable
      unitType: size?.unitType || 'size', // Default to size if not provided
      sizeLabel: size?.sizeLabel || '', // Default to empty string if not provided
    }));
  }
}
