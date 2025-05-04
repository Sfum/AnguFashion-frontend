import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.sass'],
})
export class CategoryListComponent implements OnInit {
  displayedColumns: string[] = [
    'category_name',
    'category_description',
    'delete'
  ];

  dataSource: MatTableDataSource<Category>;
  categories: Category[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;  // ViewChild to access the paginator component for pagination functionality.

  constructor(private categoryService: CategoryService,
              private snackbarService: SnackbarService) {
  }

  // Lifecycle hook called on component initialization.
  ngOnInit(): void {
    // Fetch categories from the service and initialize the data source for the table.
    this.categoryService.getCategories().subscribe((categories) => {
      this.categories = categories;  // Store the fetched categories in the local array.
      this.dataSource = new MatTableDataSource<Category>(this.categories);  // Initialize MatTableDataSource with the fetched categories.
      this.dataSource.paginator = this.paginator;  // Assign the paginator to the data source for pagination.
    });
  }

  // Method to handle category deletion.
  deleteCategory(id: string) {
    // Confirm deletion with the user.
    if (confirm('Are you sure you want to delete this category?')) {
      // Call the category service to delete the category by ID.
      this.categoryService
        .deleteCategory(id)
        .then(() => {
          // On successful deletion, show a success message and refresh the list of categories.
          this.snackbarService.showSnackbar('Category deleted successfully');
          this.categoryService.getCategories().subscribe((categories) => {
            this.categories = categories;  // Update the local categories array with the refreshed list.
            this.dataSource.data = this.categories;  // Update the data source with the new list of categories.
          });
        })
        .catch((error) => {
          // On failure, show an error message.
          this.snackbarService.showSnackbar('Failed to delete category');
        });
    }
  }
}
