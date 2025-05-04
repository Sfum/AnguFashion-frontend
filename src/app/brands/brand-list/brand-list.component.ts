import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Brand } from '../../models/brand';
import { BrandService } from '../../services/brand.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.sass'], // Corrected styleUrl to styleUrls
})
export class BrandListComponent implements OnInit {
  // Columns to be displayed in the table
  displayedColumns: string[] = ['brand_name', 'brand_description', 'delete'];

  // Data source for the table, initialized as a MatTableDataSource
  dataSource: MatTableDataSource<Brand> = new MatTableDataSource<Brand>();

  // Array to hold the list of brands
  brands: Brand[] = [];

  // Reference to the paginator component for pagination
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  constructor(
    private brandService: BrandService,
    private snackbarService: SnackbarService, 
  ) {}

  ngOnInit(): void {
    // Fetch brands from the service and initialize the data source
    this.brandService.getBrands().subscribe((brands) => {
      this.brands = brands; // Assign fetched brands to the local array
      this.dataSource = new MatTableDataSource<Brand>(this.brands); // Create a new data source with the brands
      // @ts-ignore
      this.dataSource.paginator = this.paginator; // Set paginator for the data source
    });
  }

  // Method to delete a brand by its ID
  deleteBrand(id: string): void {
    if (confirm('Are you sure you want to delete this brand?')) {
      // Confirm deletion from the user
      this.brandService.deleteBrand(id) // Call service to delete the brand
        .then(() => {
          this.snackbarService.showSnackbar('Brand deleted successfully'); // Show success message
          // Refresh the brand list
          this.brandService.getBrands().subscribe((brands) => {
            this.brands = brands; // Update local brands array
            this.dataSource.data = this.brands; // Refresh the data source with updated brands
          });
        })
        .catch((error) => {
          this.snackbarService.showSnackbar('Failed to delete brand'); // Show error message
          console.error('Error deleting brand:', error); // Log the error
        });
    }
  }
}
