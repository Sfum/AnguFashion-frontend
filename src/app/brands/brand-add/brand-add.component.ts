import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandService } from '../../services/brand.service';
import { Brand } from '../../models/brand';
import { Router } from '@angular/router';

@Component({
  selector: 'app-brand-add',
  templateUrl: './brand-add.component.html',
  styleUrls: ['./brand-add.component.sass'],
})
export class BrandAddComponent {

  brandForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private brandService: BrandService,
    public router: Router,
  ) {
    // Initialize the form group with form controls and validators
    this.brandForm = this.formBuilder.group({
      _id: [''], // Hidden field for internal use, e.g., for update operations
      id: [''], // Hidden field for additional internal use or identification
      brand_name: ['', Validators.required], // Required field for brand name
      brand_description: ['', Validators.required], // Required field for brand description
    });
  }

  onSubmit(): void {
    // Check if the form is valid before proceeding
    if (this.brandForm.valid) {
      // Create a new brand object from form values
      const newBrand: Brand = {
        _id: this.brandForm.value._id,
        id: this.brandForm.value.id,
        brand_name: this.brandForm.value.brand_name,
        brand_description: this.brandForm.value.brand_description,
      };
      // Use the brand service to add the new brand
      this.brandService
        .addBrand(newBrand)
        .then(() => {
          // Log success message and reset the form
          console.log('Brand added successfully.');
          this.brandForm.reset();
          // Navigate to the manage-brands page
          this.router.navigate(['/manage-brands']);
        })
        .catch((error) => {
          // Log error message if the brand addition fails
          console.error('Error adding brand: ', error);
        });
    } else {
      console.log('Form is invalid. Please fill in all required fields.');
    }
  }
}
