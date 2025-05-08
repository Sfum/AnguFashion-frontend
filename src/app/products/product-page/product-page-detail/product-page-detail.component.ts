import {Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Product, ProductComment, ProductSize} from '../../../models/product';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductService} from '../../../services/product.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../../services/auth.service';
import {Timestamp} from 'firebase/firestore';
import {DateService} from '../../../services/date.service';
import {WishlistService} from '../../../services/wishlist.service';
import {CartService} from '../../../services/cart.service';

@Component({
  selector: 'app-product-page-detail',
  templateUrl: './product-page-detail.component.html',
  styleUrls: ['./product-page-detail.component.sass'],
})
export class ProductPageDetailComponent implements OnInit {
  // Arrays to store related products
  relatedProductsByCategory: Product[] = [];
  relatedProductsByBrand: Product[] = [];

  // Variables for managing comments and pagination
  comments: ProductComment[] = [];
  paginatedComments: ProductComment[] = [];
  product!: Product | undefined;
  commentForm!: FormGroup;
  userId!: string;
  userName!: string;
  averageRating: number = 0;
  productImages: string[] = [];
  currentImage: string = '';
  placeholderImage: string | undefined;

  // Pagination settings
  pageSize: number = 5;  // Number of comments per page
  currentPage: number = 0;  // Current page index for pagination

  // Inputs for user-selected quantity, size, and color
  @Input() userSelectedQuantity: number = 1;
  @Input() selectedSize!: ProductSize | null;
  @Input() selectedColor!: string;

  constructor(
    private route: ActivatedRoute,  // Inject ActivatedRoute to access route parameters
    private productService: ProductService,  // Inject ProductService to interact with product data
    private authService: AuthService,  // Inject AuthService to access user authentication data
    private fb: FormBuilder,  // Inject FormBuilder to create forms
    private dateService: DateService,  // Inject DateService for formatting dates
    private wishlistService: WishlistService,  // Inject WishlistService to handle wishlist operations
    private cartService: CartService,  // Inject CartService for shopping cart functionality
  ) {}

  ngOnInit(): void {
    // Fetch product ID from route parameters and load product details
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('id');  // Get the product ID from route parameters
      if (productId) {
        this.loadProductDetails(productId);  // Load product details if productId is available
      }
    });

    const productId = this.route.snapshot.params['id'];  // Get the product ID from route snapshot
    if (productId) {
      // Load product details and related products from the service
      this.productService.getProductSnapShot(productId).subscribe(
        (productData: Product | null) => {
          if (productData) {
            this.product = productData;  // Assign fetched product data to the `product` variable
            this.productImages = this.product.product_image.slice(0, 6);  // Get first 6 images for the product
            this.currentImage = this.product.product_image[0];  // Set the first image as the main image
            this.fetchRelatedProductsByCategory();  // Fetch related products by category
            this.fetchRelatedProductsByBrand();  // Fetch related products by brand
            this.loadComments(productId);  // Load comments for the product
          } else {
            console.error('Product not found');
          }
        },
        (error) => {
          console.error('Error fetching product snapshot:', error);
        }
      );
    }

    // Initialize the comment form with default rating set to 5
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],  // Require a comment text
      rating: [5, Validators.required],  // Default rating set to 5 stars
    });

    // Fetch user information from the auth service
    this.authService.user$.subscribe((user) => {
      this.userId = user?.uid ?? '';  // Set the user ID
      this.userName = user?.displayName ?? 'Anonymous';  // Set the user name
    });

    // Load comments for the product based on product ID
    this.loadComments(productId);
  }

  // Fetch product details by product ID
  loadProductDetails(productId: string): void {
    this.productService.getProductSnapShot(productId).subscribe(
      (productData: Product | null) => {
        if (productData) {
          this.product = productData;  // Assign fetched product data
          this.productImages = this.product.product_image.slice(0, 6);  // Get first 6 images
          this.currentImage = this.product.product_image[0];  // Set the first image as the main image
          this.fetchRelatedProductsByCategory();  // Fetch related products by category
          this.fetchRelatedProductsByBrand();  // Fetch related products by brand
          this.loadComments(productId);  // Load comments for the product
        } else {
          console.error('Product not found');
        }
      },
      (error) => {
        console.error('Error fetching product snapshot:', error);
      }
    );
  }

  // Fetch related products by category
  fetchRelatedProductsByCategory(): void {
    if (this.product?.categoryId) {
      this.productService.getProductsByCategory(this.product.categoryId).subscribe(
        (products) => {
          this.relatedProductsByCategory = products.filter((p) => p.id !== this.product?.categoryId);
        },
        (error) => {
          console.error('Error fetching related products by category:', error);
        }
      );
    }
  }

  // Fetch related products by brand
  fetchRelatedProductsByBrand(): void {
    if (this.product?.brandId) {
      this.productService.getProductsByBrand(this.product.brandId).subscribe(
        (products) => {
          this.relatedProductsByBrand = products.filter((p) => p.id !== this.product?.brandId);
        },
        (error) => {
          console.error('Error fetching related products by brand:', error);
        }
      );
    }
  }

  // Load comments for the product
  loadComments(productId: string): void {
    this.productService.getComments(productId).subscribe((comments) => {
      // Map over comments and convert date to a Date object
      this.comments = comments.map((comment) => ({
        ...comment,
        date_created: this.convertToDate(comment.date_created.toString()),
      }));

      // Sort comments by creation date in descending order
      this.comments.sort((a, b) => {
        const dateA = this.convertToDate(a.date_created.toString());
        const dateB = this.convertToDate(b.date_created.toString());
        return dateB.getTime() - dateA.getTime();  // Sort by most recent comment
      });

      this.calculateAverageRating();  // Calculate the average rating from comments
      this.updatePaginatedComments();  // Update paginated comments
    });
  }

  // Convert different date formats to a Date object
  private convertToDate(value: Timestamp | Date | string): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    } else if (value instanceof Date) {
      return value;
    } else {
      return new Date(value);
    }
  }

  // Calculate the average rating from all comments
  calculateAverageRating() {
    if (this.comments.length === 0) {
      this.averageRating = 0;
      return;
    }

    const totalRating = this.comments.reduce(
      (acc, comment) => acc + comment.rating,
      0
    );
    this.averageRating = totalRating / this.comments.length;
  }

  // Set the rating value in the comment form
  setRating(rating: number) {
    this.commentForm.patchValue({ rating });
  }

  // Add a new comment to the product
  addComment(productId: string): void {
    if (this.commentForm.invalid) {
      return;  // Return early if the form is invalid
    }

    const comment: ProductComment = {
      userId: this.userId,
      userName: this.userName,
      comment: this.commentForm.value.comment,
      rating: this.commentForm.value.rating,
      date_created: new Date(),
    };

    // Subscribe to the service to add a new comment
    this.productService.addComment(productId, comment).subscribe(
      () => {
        this.commentForm.reset();  // Reset the form after successful submission
        this.loadComments(productId);  // Reload comments after adding the new one
      },
      (error) => {
        console.error('Error adding comment:', error);
      }
    );
  }

  // Update the list of comments for the current page
  updatePaginatedComments() {
    const startIndex = this.currentPage * this.pageSize;
    this.paginatedComments = this.comments.slice(startIndex, startIndex + this.pageSize);
  }

  // Handle page change event from paginator
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.updatePaginatedComments();
  }

  // Add the product to the wishlist
  addToWishlist(product: Product) {
    this.wishlistService.addToWishlist(product).subscribe({
      next: () => console.log(`${product.product_name} added to wishlist`),
      error: (err) => console.error('Failed to add to wishlist:', err),
    });
  }

  // Add the product to the cart
  addToCart(selectedSize: ProductSize | null, color: string): void {
    // Check if product data and selected size are valid
    if (!this.product || !selectedSize) {
      console.error('Product and size are required.');
      return;
    }

    // Determine the quantity to purchase (default to 1 if not specified)
    const purchaseQuantity = this.userSelectedQuantity || 1;
    if (purchaseQuantity <= 0) {
      console.error('Invalid purchase quantity:', purchaseQuantity);
      return;
    }

    // Add the product to the cart
    this.cartService.addToCart(this.product, selectedSize, color, purchaseQuantity).subscribe({
      next: () => {
        console.log(`Product added to cart successfully: ${this.product.product_name}`);
      },
      error: (err) => {
        console.error('Error adding product to cart:', err);
      }
    });
  }

  // Update the main image when a thumbnail is clicked
  setMainImage(image: string) {
    this.currentImage = image;
  }

  // Format the date using DateService
  formatDate(date: any) {
    return this.dateService.formatDate(date);
  }

  // Get the relevant unit for product size
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }
}
