import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BrandService } from '../../services/brand.service'; // Service to handle brand data
import { ActivatedRoute, Router } from '@angular/router'; // For route parameters and navigation
import { Observable } from 'rxjs'; // To handle asynchronous data streams
import { Brand } from '../../models/brand'; // Brand model

@Component({
  selector: 'app-brand-edit', // Selector for the component
  templateUrl: './brand-edit.component.html', // HTML template for this component
  styleUrls: ['./brand-edit.component.sass'], // CSS/SASS file for styling
})
export class BrandEditComponent implements OnInit {

  brandForm: FormGroup;
  brandId!: string;
  brandEdit$: Observable<Brand[]> | undefined;

  constructor(
    private fb: FormBuilder,
    private brandService: BrandService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // Initialize the form with validators for required fields
    this.brandForm = this.fb.group({
      brand_name: ['', Validators.required], // Brand name is required
      brand_description: ['', Validators.required], // Brand description is required
    });

    // Fetch the list of all brands and assign it to the Observable
    this.brandEdit$ = this.brandService.getBrands();
  }

  // Lifecycle hook to initialize the component and load brand data
  ngOnInit(): void {
    this.brandId = this.route.snapshot.paramMap.get('_id') || ''; // Retrieve brand ID from route
    this.loadBrand(); // Load the data for the specific brand using the ID
  }

  // Load the brand data for the given brand ID
  loadBrand() {
    this.brandService.getBrand(this.brandId).subscribe(
      (brand) => {
        if (brand) {
          const { id, ...brandData } = brand; // Extract brand data excluding the ID
          this.brandForm.patchValue(brandData); // Populate form fields with the fetched data
        } else {
          console.error('Brand not found'); // Log an error if the brand is not found
        }
      },
      (error) => {
        console.error('Error retrieving brand: ', error); // Log any error during brand data retrieval
      },
    );
  }

  // Handle form submission when the user submits the form
  onSubmit() {
    if (this.brandForm.valid) {
      this.updateBrandAsync(); // Update the brand data asynchronously if the form is valid
    } else {
      console.log('Form is invalid. Please fill in all required fields.'); // Notify the user if the form is invalid
    }
  }

  // Update the brand data asynchronously using the BrandService
  async updateBrandAsync() {
    try {
      await this.brandService.updateBrand(this.brandId, this.brandForm.value); // Update the brand in the backend
      await this.router.navigate(['/manage-brands']); // Navigate to the manage brands page upon successful update
    } catch (error) {
      console.error('Error updating brand: ', error); // Log any error during the update process
    }
  }
}
