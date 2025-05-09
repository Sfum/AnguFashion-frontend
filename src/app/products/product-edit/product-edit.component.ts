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
        this.updateSize()
      ]),
      colors: this.fb.array([]),
      discountPercentage: [{value: '', disabled: true}],
      salePrice: [''],
      onSale: [''],
      in_bundle: [''],
    });
    this.productEdit$ = this.productService.productsArrayFiltered$;

  }

  ngOnInit(): void {
    // Get the product ID from the route parameters
    this.productId = this.route.snapshot.paramMap.get('id') || '';

    // Subscribe to changes in 'onSale' and update sale prices accordingly
    this.productForm.get('onSale')?.valueChanges.subscribe(() => {
      this.updateSalePrices();
    });

    // Subscribe to changes in 'discountPercentage' and update sale prices accordingly
    this.productForm.get('discountPercentage')?.valueChanges.subscribe(() => {
      this.updateSalePrices();
    });

    // Load the product details on initialization
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

// Getter for 'sizes' FormArray to simplify access to the sizes array
  get sizes(): FormArray {
    return this.productForm.get('sizes') as FormArray;
  }

// Getter for 'colors' FormArray to simplify access to the colors array
  get colors(): FormArray {
    return this.productForm.get('colors') as FormArray;
  }

// Getter for 'sizeLabel' FormArray to simplify access to the size labels array
  get sizeLabel(): FormArray {
    return this.productForm.get('sizeLabel') as FormArray;
  }

// Adds a new size group to the 'sizes' FormArray
  addSize(): void {
    const sizeGroup = this.fb.group({
      size: [0, [Validators.required, Validators.min(0)]],
      quantity: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      salePrice: [0, [Validators.min(0)]],
      unitType: ['size', Validators.required],
      sizeLabel: [''],
    });
    this.sizes.push(sizeGroup);
  }

// Helper method to create a new size form group with salePrice
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

// Updates sale prices based on the 'onSale' and 'discountPercentage' form values
  updateSalePrices(): void {
    const onSale = this.productForm.get('onSale')?.value;
    const discountPercentage = this.productForm.get('discountPercentage')?.value;

    if (onSale && discountPercentage > 0) {
      // Apply the discount to each size's price if 'onSale' is true
      this.sizes.controls.forEach((control) => {
        const price = control.get('price')?.value;
        const salePrice = price * (1 - discountPercentage / 100);
        control.get('salePrice')?.setValue(+salePrice.toFixed(2), {emitEvent: false});
      });
    } else {
      // Reset sale prices to regular prices if 'onSale' is false
      this.sizes.controls.forEach((control) => {
        const price = control.get('price')?.value;
        control.get('salePrice')?.setValue(price, {emitEvent: false});
      });
    }
  }

// Removes a size from the 'sizes' FormArray
  removeSize(index: number): void {
    this.sizes.removeAt(index);
  }

// Sanitize the sizes array to ensure consistency in data
  private sanitizeSizes(sizes: any[]): any[] {
    return sizes.map((size) => ({
      id: size?.id || null,
      size: Number(size?.size) || 0,
      quantity: Number(size?.quantity) || 0,
      price: parseFloat(size?.price || '0'),
      salePrice: parseFloat(size?.salePrice || '0'),
      unitType: size?.unitType || 'size',
      sizeLabel: size?.sizeLabel || '',
    }));
  }

// Adds a new color to the 'colors' FormArray
  addColor(): void {
    this.colors.push(this.fb.control(''));
  }

// Removes a color from the 'colors' FormArray
  removeColor(index: number): void {
    this.colors.removeAt(index);
  }

// Loads the product details based on the productId and patches them into the form
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

// Handles image upload and updates the form with the image URL after upload
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
              this.productForm.patchValue({product_image: this.uploadedImages});
            },
            (error) => console.error('Error getting download URL:', error),
          );
        }))
        .subscribe();
    }
  }

// Deletes an image from the uploaded images array and updates the form
  deleteImage(index: number) {
    if (index > -1 && index < this.uploadedImages.length) {
      this.uploadedImages.splice(index, 1);
      this.productForm.patchValue({product_image: this.uploadedImages});
    }
  }

// Handles form submission to update the product
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

// Handles category selection when a user selects a category
  optionCategorySelected(selectedCategoryId: number) {
    return this.productService.optionCategorySelected(selectedCategoryId);
  }
}
