import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Product } from '../../models/product';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import {SnackbarService} from '../../services/snackbar.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.sass'],
})
export class ProductEditComponent implements OnInit {
  productId: string = '';
  productForm: FormGroup;
  productEdit$: Observable<Product[]> | undefined;
  uploadedImages: string[] = []; // Array to store URLs of uploaded images
  brands$ = this.productService.brands$;
  categories$ = this.productService.categories$;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private afStorage: AngularFireStorage,
    public snackbarService: SnackbarService,
  ) {
    // Initialize the form with required validators for most fields
    this.productForm = this.fb.group({
      product_name: ['', Validators.required],
      product_title: [''],
      product_description: [''],
      categoryId: [''],
      product_image: [''],
      price: [''],
      quantityStock: [''],
      sizes: this.fb.array([
        this.updateSize() // Add this method to create a size form group
      ]),      colors: this.fb.array([]), // FormArray for colors
      discountPercentage: [{ value: '', disabled: true }],
      salePrice: [''],
      onSale: [''],
      in_bundle: [''],
    });
    this.productEdit$ = this.productService.productsArrayFiltered$;

  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id') || '';
    this.productForm.get('onSale')?.valueChanges.subscribe(() => {
      this.updateSalePrices();
    });


    this.productForm.get('discountPercentage')?.valueChanges.subscribe(() => {
      this.updateSalePrices();
    });
    this.loadProduct();


    // Monitor changes to the 'onSale' field to enable/disable related fields
    this.productForm.get('onSale')?.valueChanges.subscribe((onSale) => {
      const discountPercentageControl = this.productForm.get('discountPercentage');
      const salePriceControl = this.productForm.get('salePrice');
      if (onSale) {
        discountPercentageControl?.enable();
        salePriceControl?.enable();
      } else {
        discountPercentageControl?.disable();
        salePriceControl?.disable();
      }
    });
  }

  get sizes(): FormArray {
    return this.productForm.get('sizes') as FormArray;
  }

  get colors(): FormArray {
    return this.productForm.get('colors') as FormArray;
  }

  get sizeLabel(): FormArray {
    return this.productForm.get('sizeLabel') as FormArray;
  }

  addSize(): void {
    const sizeGroup = this.fb.group({
      size: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.min(0)]], // Sale price calculated dynamically
      unitType: ['size', Validators.required],
      sizeLabel: [''],
    });
    this.sizes.push(sizeGroup);
  }

  // Helper method to create size form group with salePrice
  updateSize(): FormGroup {
    return this.fb.group({
      size: [''],
      quantity: [''],
      price: [''],
      salePrice: [''],
      unitType: [''],
      sizeLabel: [''],
    });
  }

  updateSalePrices(): void {
    const onSale = this.productForm.get('onSale')?.value;
    const discountPercentage = this.productForm.get('discountPercentage')?.value;

    if (onSale && discountPercentage > 0) {
      this.sizes.controls.forEach((control) => {
        const price = control.get('price')?.value;
        const salePrice = price * (1 - discountPercentage / 100);
        control.get('salePrice')?.setValue(+salePrice.toFixed(2), { emitEvent: false });
      });
    } else {
      this.sizes.controls.forEach((control) => {
        const price = control.get('price')?.value;
        control.get('salePrice')?.setValue(price, { emitEvent: false });
      });
    }
  }

  removeSize(index: number): void {
    this.sizes.removeAt(index);
  }

  // Sanitize the sizes array to ensure consistency
  private sanitizeSizes(sizes: any[]): any[] {
    return sizes.map((size) => ({
      id: size?.id || null, // Ensure ID is preserved
      size: Number(size?.size) || 0, // Convert size to a number
      quantity: Number(size?.quantity) || 0, // Convert quantity to a number
      price: parseFloat(size?.price || '0'), // Ensure price is a float
      salePrice: parseFloat(size?.salePrice || '0'), // Include sale price if applicable
      unitType: size?.unitType || 'size', // Default to weight if not provided
      sizeLabel: size?.sizeLabel || '', // Default to empty string if not provided
    }));
  }

  addColor(): void {
    this.colors.push(this.fb.control(''));
  }

  removeColor(index: number): void {
    this.colors.removeAt(index);
  }

  loadProduct(): void {
    this.productService.getProduct(this.productId).subscribe(
      (product) => {
        if (product) {
          // Sanitize and clear existing FormArrays to prevent duplicates
          while (this.sizes.length !== 0) {
            this.sizes.removeAt(0);
          }
          this.colors.clear();

          // Patch the form with product data
          this.productForm.patchValue({
            ...product,
            sizes: this.sanitizeSizes(product.sizes), // Sanitize sizes
            colors: product.colors || [], // Ensure colors array is valid
          });

          // Update the image array
          this.uploadedImages = product.product_image || [];

          // Populate sizes FormArray
          product.sizes.forEach((size: { size: any; quantity: any; price: any; salePrice: any; unitType: any, sizeLabel: any }) =>
            this.sizes.push(
              this.fb.group({
                size: [size.size, Validators.required],
                quantity: [size.quantity, Validators.required],
                price: [size.price, Validators.required],
                salePrice: [size.salePrice || size.price],
                unitType: [size.unitType],
                sizeLabel: [size.sizeLabel || ''],
              })
            )
          );

          // Populate colors FormArray
          product.colors.forEach((color: any) =>
            this.colors.push(this.fb.control(color, Validators.required)),
          );
        }
      },
      (error) => console.error('Error retrieving product:', error),
    );
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const filePath = `products/${this.productId}/${file.name}`;
      const fileRef = this.afStorage.ref(filePath);
      const task = this.afStorage.upload(filePath, file);

      task.snapshotChanges()
        .pipe(finalize(() => {
          fileRef.getDownloadURL().subscribe(
            (url) => {
              this.uploadedImages.push(url);
              this.productForm.patchValue({ product_image: this.uploadedImages });
            },
            (error) => console.error('Error getting download URL:', error),
          );
        }))
        .subscribe();
    }
  }

  deleteImage(index: number) {
    if (index > -1 && index < this.uploadedImages.length) {
      this.uploadedImages.splice(index, 1);
      this.productForm.patchValue({ product_image: this.uploadedImages });
    }
  }

  // Submit the form and update the product
  onSubmit(): void {
    if (this.productForm.invalid) {
      this.snackbarService.showSnackbar('Please fill out all required fields.');
      return;
    }

    const formValue = this.productForm.value;
    const sanitizedSizes = this.sanitizeSizes(formValue.sizes || []);

    const sanitizedProduct = {
      ...formValue,
      sizes: formValue.sizes.map((size: any) => ({
        ...size,
        salePrice: size.salePrice || size.price,
        unitType: size.unitType || 'size',
        unitSizes: size.unitSizes,
      })),
    };

    this.productService.updateProduct(this.productId, sanitizedProduct).subscribe(
      () => {
        this.snackbarService.showSnackbar('Product updated successfully!');
        console.log('Product updated successfully');
      },
      (error) => {
        this.snackbarService.showSnackbar('Error updating product.');
        console.error('Error updating product:', error);
      }
    );
    const updatedProduct = {
      ...formValue,
      sizes: formValue.sizes.map((size: any) => ({
        ...size,
        salePrice: size.salePrice || size.price, // Ensure salePrice is included
        unitType: size.unitType || 'size', // Default to weight if not provided
        unitSizes: size.unitSizes,
      })),
    };

    this.productService.updateProduct(this.productId, updatedProduct).subscribe(
      () => this.snackbarService.showSnackbar('Product updated successfully!'),
      (error) => this.snackbarService.showSnackbar('Error updating product.'),
    );
  }

  // Method to handle category selection
  optionCategorySelected(selectedCategoryId: number) {
    return this.productService.optionCategorySelected(selectedCategoryId);
  }
}
