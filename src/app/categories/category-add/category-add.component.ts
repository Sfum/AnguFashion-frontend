import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/category';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-add',
  templateUrl: './category-add.component.html',
  styleUrl: './category-add.component.sass',
})
export class CategoryAddComponent {

  categoryForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private categoryService: CategoryService,
    public router: Router,
  ) {
    // Initializing the categoryForm with form controls and validation rules.
    this.categoryForm = this.formBuilder.group({
      _id: [''],
      id: [''],
      category_name: ['', Validators.required],
      category_description: ['', Validators.required],
    });
  }

  // Function triggered when the form is submitted.
  onSubmit(): void {
    // Check if the form is valid before proceeding.
    if (this.categoryForm.valid) {
      // Create a new category object using form values.
      const newCategory: Category = {
        _id: this.categoryForm.value._id,                   // Internal ID.
        id: this.categoryForm.value.id,                     // Public ID.
        category_name: this.categoryForm.value.category_name,     // Category name input value.
        category_description: this.categoryForm.value.category_description, // Category description input value.
      };

      // Call the category service to add the new category to the database or API.
      this.categoryService
        .addCategory(newCategory)  // Add category and handle the promise returned.
        .then(() => {
          // On success, log a message, reset the form, and navigate to another route.
          console.log('Category added successfully.');
          this.categoryForm.reset();                // Reset the form fields after submission.
          this.router.navigate(['/manage-categories']); // Navigate to the 'manage categories' page.
        })
        .catch((error) => {
          // Handle any errors that occur during the add operation.
          console.error('Error adding category: ', error);
        });
    } else {
      // Log a message if the form is invalid, prompting the user to fill in all required fields.
      console.log('Form is invalid. Please fill in all required fields.');
    }
  }
}
