import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Category } from '../../models/category';

@Component({
  selector: 'app-category-edit',
  templateUrl: './category-edit.component.html',
  styleUrl: './category-edit.component.sass',
})
export class CategoryEditComponent implements OnInit {

  categoryForm: FormGroup;
  categoryId: string;
  categoryEdit$: Observable<Category[]> | undefined;

  // ActivatedRoute to access route parameters, and Router for navigation after updating.
  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // Initializing the category form with controls for category name and description, both required.
    this.categoryForm = this.fb.group({
      category_name: ['', Validators.required],  // Field for category name with required validation.
      category_description: ['', Validators.required],  // Field for category description with required validation.
    });

    // Observable to fetch the list of categories for reference or other operations.
    this.categoryEdit$ = this.categoryService.getCategories();
  }

  // Lifecycle hook to handle initialization when the component is loaded.
  ngOnInit(): void {
    // Retrieve the category ID from the route parameters (using ActivatedRoute).
    this.categoryId = this.route.snapshot.paramMap.get('id');
    // Call the loadCategory method to load the category details for editing.
    this.loadCategory();
  }

  // Method to load the category data based on the categoryId.
  loadCategory() {
    // Call the category service to fetch the category by ID.
    this.categoryService.getCategory(this.categoryId).subscribe(
      (category) => {
        if (category) {
          // Destructure to avoid patching the 'id' field directly into the form.
          const { id, ...categoryData } = category;

          // Populate the form fields with the retrieved category data.
          this.categoryForm.patchValue(categoryData);
        } else {
          console.error('Category not found');  // Log if the category is not found.
        }
      },
      (error) => {
        console.error('Error retrieving category: ', error);  // Handle any errors in fetching the category.
      },
    );
  }
  // Submit the form
  onSubmit() {
    if (this.categoryForm.valid) {
      // Use async/await for promise-based operations
      this.updateCategoryAsync();
    } else {
      console.log('Form is invalid. Please fill in all required fields.');
    }
  }
  // Update Category
  async updateCategoryAsync() {
    try {
      // Await the promise-based update operation
      await this.categoryService.updateCategory(this.categoryId, this.categoryForm.value);
      // On successful update, navigate to the manage categories page
      this.router.navigate(['/manage-categories']);
    } catch (error) {
      console.error('Error updating category: ', error); // Handle errors during category update
    }
  }
}
