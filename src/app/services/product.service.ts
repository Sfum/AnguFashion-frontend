// Import core Angular and RxJS functionalities along with models and other services
import {Injectable} from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  map,
  Observable,
  of,
  Subject,
  shareReplay,
  throwError, takeUntil,
} from 'rxjs';
import {Product, ProductComment} from '../models/product';
import {CategoryService} from './category.service';
import {BrandService} from './brand.service';
import {Category} from '../models/category';
import {Brand} from '../models/brand';
import {SnackbarService} from './snackbar.service';
import {Router} from '@angular/router';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {switchMap, tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root', // This service is provided at the root level
})
export class ProductService {
  // Define API endpoints using environment variables
  private productsURL = `${environment.apiUrl}/products`;
  private usersURL = `${environment.apiUrl}/users`;

  // Observables for products, categories, and brands
  products$: Observable<Product[]> = this.getProducts();
  categories$: Observable<Category[]> = this.categoryService.getCategories();
  brands$: Observable<Brand[]> = this.brandService.getBrands();

  // Local cache for products (if needed)
  products: Product[] = [];

  // Subject to manage unsubscriptions and avoid memory leaks
  private unsubscribe$: Subject<void> = new Subject<void>();

  // Observable to hold on-sale products with shareReplay caching
  onSaleProducts$ = this.getOnSaleProducts().pipe(shareReplay(1));

  // Subjects for selected brand and category, used in filtering streams
  private brandSelectedSubject = new BehaviorSubject<number | null>(null);
  private categorySelectedSubject = new BehaviorSubject<number | null>(null);

  // Loading spinner state management
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  // BehaviorSubject for selected sizes
  private selectedSizesSubject = new BehaviorSubject<string[]>([]);
  selectedSizesAction$ = this.selectedSizesSubject.asObservable();

  // BehaviorSubject for search queries
  private searchQuerySubject = new BehaviorSubject<string>('');
  searchQuery$ = this.searchQuerySubject.asObservable();

  // BehaviorSubject for selected colors
  private selectedColorsSubject = new BehaviorSubject<string[]>([]);
  selectedColorsAction$ = this.selectedColorsSubject.asObservable();

  // Subject for product updates via server-sent events
  private productUpdatesSubject = new Subject<any>();
  productUpdates$ = this.productUpdatesSubject.asObservable();

  // BehaviorSubject for selected price range
  private priceRangeSelectedSubject = new BehaviorSubject<{ min: number; max: number }>({min: 0, max: Infinity});
  priceRangeSelectedAction$ = this.priceRangeSelectedSubject.asObservable();

  // Expose brand and category selection as observables
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();
  brandSelectedAction$ = this.brandSelectedSubject.asObservable();

  // Subjects for selected size labels and available size labels
  private selectedSizeLabelsSubject = new BehaviorSubject<string[]>([]);
  selectedSizeLabelsAction$ = this.selectedSizeLabelsSubject.asObservable();

  // Initially empty available size labels subject that will be updated from the API
  private availableSizeLabelsSubject = new BehaviorSubject<string[]>([]);
  availableSizeLabels$ = this.availableSizeLabelsSubject.asObservable();

  // Define BehaviorSubject for filtered products
  private filteredProductsSubject = new BehaviorSubject<Product[]>([]);
  filteredProducts$ = this.filteredProductsSubject.asObservable();

  // Subject for all products
  private allProductsSubject = new BehaviorSubject<Product[]>([]);
  // Expose observable for all products
  allProducts$ = this.allProductsSubject.asObservable();

  // Constructor to inject all required services and initialize subscriptions
  constructor(
    private categoryService: CategoryService,
    private brandService: BrandService,
    public snackbarService: SnackbarService,
    public router: Router,
    private httpClient: HttpClient,
  ) {
    // Subscribe to brand and category selection subjects with proper unsubscription
    this.brandSelectedSubject.pipe(takeUntil(this.unsubscribe$)).subscribe();
    this.categorySelectedSubject.pipe(takeUntil(this.unsubscribe$)).subscribe();

    // Fetch available size labels when the service is instantiated
    this.fetchAvailableSizeLabels();
  }

  // --------------------------
  // METHODS FOR FETCHING DATA
  // --------------------------

  // Fetch product list from the backend API
  getProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(this.productsURL).pipe(
      tap((products: Product[]) => {
        // Optional: Do something with the products if needed
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to fetch products')),
    );
  }

  // Fetch on-sale products from the backend API
  getOnSaleProducts(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.productsURL}/on-sale`);
  }

  // Fetch available sizes from the backend API
  getAvailableSizes(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.productsURL}/available-sizes`).pipe(
      catchError((error) => {
        console.error('Error fetching available sizes:', error);
        return of([]); // Return empty array on error
      }),
    );
  }

  // Fetch available colors from the backend API
  getAvailableColors(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.productsURL}/available-colors`).pipe(
      catchError((error) => {
        console.error('Error fetching available colors:', error);
        return of([]); // Return empty array on error
      }),
    );
  }

  fetchAvailableSizeLabels(): Observable<string[]> {
    return this.httpClient.get<string[]>(`${this.productsURL}/available-size-labels`).pipe(
      catchError((error) => {
        console.error('Error fetching available sizes:', error);
        return of([]); // Return empty array on error
      }),
    );
  }


  // Fetch a single product by its ID
  getProduct(id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.productsURL}/${id}`).pipe(
      tap(() => {
        // Optional: Do something after fetching the product
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to fetch product')),
    );
  }

  // Fetch products uploaded by a specific uploader
  getProductsByUploader(uploaderId: string): Observable<Product[]> {
    const url = `${this.productsURL}/uploader/${uploaderId}`;
    return this.httpClient.get<Product[]>(url).pipe(
      catchError(error => {
        console.error('Error fetching products by uploader:', error);
        return throwError(() => new Error('Failed to fetch products by uploader'));
      })
    );
  }

  // Fetch a product snapshot (plain Product object or null) by its ID
  getProductSnapShot(id: string): Observable<Product | null> {
    const url = `${this.productsURL}/${id}`;
    return this.httpClient.get<Product | null>(url);
  }

  // --------------------------
  // METHODS FOR UPDATING DATA
  // --------------------------

  // Add a new product using the provided product object and uploader ID
  addProduct(product: Product, uid: string): Observable<Product> {
    return this.httpClient.get<any>(`${this.usersURL}/${uid}`).pipe(
      switchMap((userData) => {
        if (!userData || !userData.brandId) {
          console.error('Brand ID missing in user data:', userData);
          this.snackbarService.showSnackbar('Brand ID is required to add a product.');
          return throwError(() => new Error('Brand ID is missing or undefined.'));
        }
        product.brandId = userData.brandId;
        return this.httpClient.post<Product>(`${this.productsURL}`, {product, uid}).pipe(
          tap(() => {
            this.snackbarService.showSnackbar('Product added successfully!');
            this.router.navigate(['/manage-products']);
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Error adding product:', error);
            return this.handleError(error, 'Failed to add product');
          })
        );
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error retrieving user data:', error);
        return throwError(() => new Error('Failed to retrieve user data.'));
      })
    );
  }

  // Update an existing product by its ID with new product data
  updateProduct(id: string, product: Product): Observable<void> {
    return this.httpClient.put<void>(`${this.productsURL}/${id}`, product).pipe(
      tap(() => {
        console.log('Product updated successfully!');
        this.snackbarService.showSnackbar('Product updated successfully!');
        this.router.navigate(['/manage-products']);
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to update product')),
    );
  }

  // Delete a product by its ID
  deleteProduct(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.productsURL}/${id}`).pipe(
      tap(() => {
        console.log('Product deleted successfully!');
        this.snackbarService.showSnackbar('Product deleted successfully!');
        this.router.navigate(['/manage-products']);
      }),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Failed to delete product')),
    );
  }

  // Update the selected sizes by emitting a new value on the BehaviorSubject
  updateSelectedSizes(sizes: string[]): void {
    this.selectedSizesSubject.next(sizes);
  }

  // Update the selected colors by emitting a new value on the BehaviorSubject
  updateSelectedColors(colors: string[]): void {
    this.selectedColorsSubject.next(colors);
  }

  // Update the search query used in filtering
  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  // Update the selected price range used in filtering
  optionPriceRangeSelected(minPrice: number, maxPrice: number): void {
    this.priceRangeSelectedSubject.next({
      min: minPrice,
      max: maxPrice,
    });
  }

  // --------------------------
  // STREAMS FOR FILTERING PRODUCTS
  // --------------------------

  // Stream to filter products based on selected brand
  brandActionStream$ = combineLatest([
    this.products$,
    this.brandSelectedAction$
  ]).pipe(
    map(([products, selectedBrandIds]) => {
      if (!Array.isArray(selectedBrandIds) || selectedBrandIds.length === 0) {
        return products;
      } else {
        return products.filter(product => selectedBrandIds.includes(product.brandId));
      }
    }),
    catchError((err) => {
      return EMPTY;
    }),
  );

  // Stream to filter products based on selected category
  categoryActionStream$ = combineLatest([
    this.brandActionStream$,
    this.categorySelectedAction$,
  ]).pipe(
    map(([products, selectedCategoryId]) =>
      products.filter((product) =>
        selectedCategoryId ? product.categoryId === selectedCategoryId : true,
      ),
    ),
    catchError((err) => {
      return EMPTY;
    }),
  );

  // Stream to filter products based on selected price range
  priceActionStream$ = combineLatest([
    this.categoryActionStream$,
    this.priceRangeSelectedAction$,
  ]).pipe(
    map(([products, priceRange]) =>
      products.filter(
        (product) =>
          product.price >= priceRange.min && product.price <= priceRange.max,
      ),
    ),
    catchError((err) => {
      return EMPTY;
    }),
  );

  // Stream to pre-map brand and category names into the product object
  productsPreArrayFiltered$ = combineLatest([
    this.priceActionStream$,
    this.brands$,
    this.categories$,
  ]).pipe(
    map(([products, brands, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            categoryId: categories.find((c) => product.categoryId === c.id)?.['category_name'],
            brandId: brands.find((c) => product.brandId === c.id)?.['brand_name'],
          }) as unknown as Product,
      ),
    ),
    shareReplay(1),
  );

  // Stream to combine pre-filtered products with selected sizes, price range, and colors
  productsArrayFiltered$ = combineLatest([
    this.productsPreArrayFiltered$,    // Products filtered by brand, category, etc.
    this.selectedSizesSubject.asObservable(),  // Selected sizes
    this.priceRangeSelectedAction$,    // Price range selection
    this.selectedColorsSubject.asObservable(), // Selected colors
    this.selectedSizeLabelsSubject.asObservable(), // Selected size labels for filtering
  ]).pipe(tap(([products, selectedSizes, priceRange, selectedColors, selectedSizeLabels]) => {
      console.log('productsPreArrayFiltered$', products);
      console.log('selectedSizes$', selectedSizes);
      console.log('priceRange$', priceRange);
      console.log('selectedColors$', selectedColors);
      console.log('selectedSizeLabels$', selectedSizeLabels);
    }),
    map(([
           products,
           selectedSizes,
           priceRange,
           selectedColors,
           selectedSizeLabels
         ]) => {
      let filteredProducts = products;

      // Filter by selected size labels
      if (selectedSizeLabels.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          // Check if the product has sizes and sizeLabels
          return product.sizes && product.sizes.some(sizeObj =>
            selectedSizeLabels.includes(sizeObj.sizeLabel)
          );
        });
      }

      // Filter by selected sizes
      if (selectedSizes.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          const sizesArray = this.normalizeSizes(product.sizes);
          return sizesArray.some(sizeObj => selectedSizes.includes(sizeObj.size.toString()));
        });
      }

      // Filter by price range
      filteredProducts = filteredProducts.filter(
        product => product.price >= priceRange.min && product.price <= priceRange.max
      );

      // Filter by selected colors
      if (selectedColors.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
          product.colors && Array.isArray(product.colors) &&
          product.colors.some(color => selectedColors.includes(color))
        );
      }


      return filteredProducts;
    }),
    catchError((error) => {
      console.error('Error filtering products:', error);
      return []; // Return an empty array in case of an error
    }),
    shareReplay(1) // Cache the filtered results for performance
  );


  // Stream to combine on-sale products with additional brand and category information
  productsArrayOnSale$ = combineLatest([
    this.onSaleProducts$,
    this.brands$,
    this.categories$,
  ]).pipe(
    map(([products, brands, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            categoryName: categories.find((c) => product.categoryId === c.id)?.['category_name'],
            brandName: brands.find((c) => product.brandId === c.id)?.['brand_name'],
          }) as unknown as Product,
      ).filter((product) => product.onSale),
    ),
    shareReplay(1),
  );


  // Method to return the filtered product collection observable
  getFilteredProductCollection() {
    return this.productsArrayFiltered$;
  }

  // Fetch products by category from the backend API
  getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.productsURL}/categories/${categoryId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching products by category:', error);
        if (error.status === 200 && error.error) {
          console.error('Unexpected error payload:', error.error);
        }
        return throwError(() => new Error('Something went wrong while fetching products by category'));
      }),
    );
  }

  // Fetch products by brand from the backend API
  getProductsByBrand(brandId: number): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.productsURL}/brands/${brandId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching products by brand:', error);
        if (error.status === 200 && error.error) {
          console.error('Unexpected error payload:', error.error);
        }
        return throwError(() => new Error('Something went wrong while fetching products by brand'));
      }),
    );
  }

  // --------------------------
  // HELPER METHODS
  // --------------------------

  // Handle brand selection by resetting previous selections and setting the new brand ID
  optionBrandSelected(selectedBrandId: number) {
    this.brandSelectedSubject.next(0); // Reset current brand selection
    this.categorySelectedSubject.next(0); // Reset current category selection
    this.brandSelectedSubject.next(selectedBrandId); // Set new brand ID
  }

  // Handle category selection by resetting previous selections and setting the new category ID
  optionCategorySelected(selectedCategoryId: number) {
    this.brandSelectedSubject.next(0); // Reset current brand selection
    this.categorySelectedSubject.next(0); // Reset current category selection
    this.categorySelectedSubject.next(+selectedCategoryId); // Set new category ID
  }

// Method to update selected size labels and trigger filtering
  updateSelectedSizeLabels(selectedLabels: string[]): void {
    console.log('Updated selected size labels:', selectedLabels);
    this.selectedSizeLabelsSubject.next(selectedLabels); // Update the selected size labels
    this.applyLocalFilters(); // Apply local filtering based on updated selections
  }

// Local filtering method to apply size label filtering
  private applyLocalFilters(): void {
    const allProducts = this.allProductsSubject.getValue();
    const selectedSizeLabels = this.selectedSizeLabelsSubject.getValue();

    console.log('All Products:', allProducts);
    console.log('Selected Size Labels for Filtering:', selectedSizeLabels);

    let filteredProducts: Product[];

    if (selectedSizeLabels.length > 0) {
      filteredProducts = allProducts.filter(product => {
        // Loop through each size in product.sizes and check if sizeLabel matches the selected size labels
        let matchFound = false;
        for (let size of product.sizes) {
          if (selectedSizeLabels.includes(size.sizeLabel)) {
            matchFound = true;
            break;
          }
        }
        return matchFound;
      });
    } else {
      filteredProducts = allProducts; // No filtering by size labels if none are selected
    }
    console.log('Locally Filtered Products:', filteredProducts);
    this.allProductsSubject.next(filteredProducts); // Update the allProductsSubject with filtered products
  }

// Stream for fetching filtered products from the backend using HTTP parameters
  filteredProductsQuery$: Observable<Product[]> = combineLatest([
    this.brandSelectedAction$,
    this.categorySelectedAction$,
    this.priceRangeSelectedAction$,
    this.searchQuery$,
    this.selectedColorsAction$,
    this.selectedSizesAction$,
    this.selectedSizeLabelsSubject.asObservable(), // Watch size label changes here
  ]).pipe(
    switchMap(([brandId, categoryId, priceRange, searchQuery, selectedColors, selectedSizes, selectedSizeLabels]) => {
      let params = new HttpParams();

      if (brandId) {
        params = params.set('brandId', brandId.toString());
      }
      if (categoryId) {
        params = params.set('categoryId', categoryId.toString());
      }
      if (priceRange.min !== null && priceRange.min !== undefined) {
        params = params.set('minPrice', priceRange.min.toString());
      }
      if (priceRange.max !== null && priceRange.max !== undefined && priceRange.max !== Infinity) {
        params = params.set('maxPrice', priceRange.max.toString());
      }
      if (searchQuery) {
        params = params.set('searchQuery', searchQuery);
      }
      if (Array.isArray(selectedColors) && selectedColors.length > 0) {
        params = params.set('colors', selectedColors.join(','));
      }
      if (Array.isArray(selectedSizes) && selectedSizes.length > 0) {
        params = params.set('sizes', selectedSizes.join(','));
      }
      if (Array.isArray(selectedSizeLabels) && selectedSizeLabels.length > 0) {
        params = params.set('sizeLabel', selectedSizeLabels.join(','));
      }

      console.log('Filtering with params:', params.toString());

      return this.httpClient.get<Product[]>(this.productsURL, { params }).pipe(
        tap((products) => {
          console.log('Filtered Products from API:', products);
          this.allProductsSubject.next(products); // Store the fetched products to apply local filtering
          // After fetching, apply local filters if necessary
          this.applyLocalFilters();
        }),
        catchError((error) => this.handleError(error, 'Failed to fetch products')),
      );
    }),
    shareReplay(1),
  );
// Get the unit string based on the provided unit type, size, and size label
  getUnit(unitType: string, size: string | number, sizeLabel: string): string {
    if (!unitType || size == null) return '';

    switch (unitType) {
      case 'size':
        return `Size ${size} ${sizeLabel}`;
      case 'waist':
        return `${size}" Waist ${sizeLabel}`;
      case 'length':
        return `${size} Length ${sizeLabel}`;
      case 'fit':
        return `${size} Fit ${sizeLabel}`;
      case 'kidsSize':
        return `Kids Size ${size} ${sizeLabel}`;
      case 'chest':
        return `${size}" Chest ${sizeLabel}`;
      case 'sleeve':
        return `${size}" Sleeve ${sizeLabel}`;
      default:
        return `${sizeLabel}`;
    }
  }

  // Fetch available size labels from the backend API
  fetchProducts(): void {
    this.httpClient.get<Product[]>(this.productsURL).pipe(
      tap((products: Product[]) => {
        console.log('Fetched products:', products);
        this.allProductsSubject.next(products);
        // Apply filtering initially (if any filters are active)
        this.applyLocalFilters();
      }),
      catchError((error) => {
        console.error('Error fetching products:', error);
        return of([]);
      })
    ).subscribe();
  }

  // Listen for product updates using server-sent events
  listenForProductUpdates(): void {
    const eventSource = new EventSource(`${this.productsURL}/updates`);
    eventSource.onmessage = (event) => {
      const updatedProduct = JSON.parse(event.data);
      this.productUpdatesSubject.next(updatedProduct);
    };
  }

  // Set the loading status (useful for spinners)
  setLoading(loading: boolean): void {
    this.isLoadingSubject.next(loading);
  }

  // Helper method to normalize sizes to an array format
  normalizeSizes(sizes: any): any[] {
    let sizesArray: any[] = [];
    if (Array.isArray(sizes)) {
      sizesArray = sizes;
    } else if (sizes && typeof sizes === 'object') {
      sizesArray = Object.values(sizes);
    } else {
      sizesArray = [];
    }
    return sizesArray.filter((sizeObj) => sizeObj && typeof sizeObj === 'object' && 'size' in sizeObj);
  }

  // Method to apply discount to the product sizes if the product is on sale
  applyDiscount(product: Product): void {
    if (product.onSale && product.discountPercentage > 0) {
      product.sizes = product.sizes.map((size) => ({
        ...size,
        salePrice: +(size.price * (1 - product.discountPercentage / 100)).toFixed(2),
      }));
    } else {
      product.sizes = product.sizes.map((size) => ({
        ...size,
        salePrice: size.price,
      }));
    }
  }

  // Convert different date formats to a JavaScript Date object
  private convertTimestamp(value: any): Date {
    if (value instanceof Date) {
      return value;
    } else if (typeof value === 'string') {
      return new Date(value);
    } else {
      return value?.toDate ? value.toDate() : new Date(value);
    }
  }

  // Centralized error handling method with snackbar notifications
  private handleError(error: HttpErrorResponse, userFriendlyMessage: string): Observable<never> {
    this.snackbarService.showSnackbar(userFriendlyMessage);
    console.error(`Backend returned error: ${error.message}`);
    return throwError(userFriendlyMessage);
  }

  // --------------------------
  // COMMENTS SECTION
  // --------------------------

  // Add a comment to a specific product
  addComment(productId: string, comment: ProductComment): Observable<void> {
    const url = `${this.productsURL}/${productId}/comments`;
    return this.httpClient.post<void>(url, comment);
  }

  // Get comments for a specific product from the backend API
  getComments(productId: string): Observable<ProductComment[]> {
    return this.httpClient.get<ProductComment[]>(`${this.productsURL}/${productId}/comments`).pipe(
      map((comments) => {
        if (Array.isArray(comments)) {
          return comments.map(comment => ({
            ...comment,
            date_created: this.convertTimestamp(comment.date_created),
          }));
        }
        throw new Error('Unexpected response format');
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.error && typeof error.error === 'string' && error.error.startsWith('<!doctype html>')) {
          console.error('Received HTML instead of JSON. Possible server issue.');
        } else {
          console.error('Error getting comments from backend API:', error);
        }
        return throwError(() => new Error('Something went wrong while fetching comments from the API'));
      }),
    );
  }

  // Clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
