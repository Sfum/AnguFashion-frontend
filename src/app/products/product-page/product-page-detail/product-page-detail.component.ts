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
  relatedProductsByCategory: Product[] = [];
  relatedProductsByBrand: Product[] = [];
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
  pageSize: number = 5; // Number of comments per page
  currentPage: number = 0; // Current page index

  @Input() userSelectedQuantity: number = 1;
  @Input() selectedSize!: ProductSize | null;
  @Input() selectedColor!: string;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private authService: AuthService,
    private fb: FormBuilder,
    private dateService: DateService,
    private wishlistService: WishlistService,
    private cartService: CartService,
  ) {
  }

  ngOnInit(): void {
    // Fetch product ID from route parameters
    this.route.paramMap.subscribe((params) => {
      const productId = params.get('id'); // Get the updated product ID from the route
      if (productId) {
        this.loadProductDetails(productId);
      }
    });
    const productId = this.route.snapshot.params['id'];
    if (productId) {
      // Load product details and related products using the corrected service
      this.productService.getProductSnapShot(productId).subscribe(
        (productData: Product | null) => {
          if (productData) {
            this.product = productData; // Assign the fetched data directly to `product`
            this.productImages = this.product.product_image.slice(0, 6); // Get first 6 images
            this.currentImage = this.product.product_image[0]; // Set the main image initially
            this.fetchRelatedProductsByCategory();
            this.fetchRelatedProductsByBrand();
            this.loadComments(productId); // Load comments after product data is loaded
          } else {
            console.error('Product not found');
          }
        },
        (error) => {
          console.error('Error fetching product snapshot:', error);
        },
      );
    }

    // Initialize comment form with default rating
    this.commentForm = this.fb.group({
      comment: ['', Validators.required],
      rating: [5, Validators.required], // Default rating to 5 stars
    });

    // Fetch user information from auth service
    this.authService.user$.subscribe((user) => {
      this.userId = user?.uid ?? '';
      this.userName = user?.displayName ?? 'Anonymous';
    });

    // Load comments for the product
    this.loadComments(productId);
  }

  loadProductDetails(productId: string): void {
    this.productService.getProductSnapShot(productId).subscribe(
      (productData: Product | null) => {
        if (productData) {
          this.product = productData;
          this.productImages = this.product.product_image.slice(0, 6); // Limit to 6 images
          this.currentImage = this.product.product_image[0]; // Set the first image as default
          this.fetchRelatedProductsByCategory();
          this.fetchRelatedProductsByBrand();
          this.loadComments(productId); // Fetch comments after loading product
        } else {
          console.error('Product not found');
        }
      },
      (error) => {
        console.error('Error fetching product snapshot:', error);
      },
    );
  }


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
      this.comments = comments.map((comment) => ({
        ...comment,
        date_created: this.convertToDate(comment.date_created.toString()),
      }));

      // Sort comments by date_created with the most recent first
      this.comments.sort((a, b) => {
        const dateA = this.convertToDate(a.date_created.toString());
        const dateB = this.convertToDate(b.date_created.toString());
        return dateB.getTime() - dateA.getTime();
      });

      this.calculateAverageRating();
      this.updatePaginatedComments();
    });
  }

  // Convert various date formats to Date objects
  private convertToDate(value: Timestamp | Date | string): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    } else if (value instanceof Date) {
      return value;
    } else {
      return new Date(value);
    }
  }

  // Calculate average rating from comments
  calculateAverageRating() {
    if (this.comments.length === 0) {
      this.averageRating = 0;
      return;
    }

    const totalRating = this.comments.reduce(
      (acc, comment) => acc + comment.rating,
      0,
    );
    this.averageRating = totalRating / this.comments.length;
  }

  // Update rating value in the form
  setRating(rating: number) {
    this.commentForm.patchValue({rating});
  }

  // Add a comment to the product
  addComment(productId: string): void {
    if (this.commentForm.invalid) {
      return;
    }

    const comment: ProductComment = {
      userId: this.userId,
      userName: this.userName,
      comment: this.commentForm.value.comment,
      rating: this.commentForm.value.rating,
      date_created: new Date(),
    };

    // Using `subscribe` instead of `then` since `addComment` returns an Observable
    this.productService.addComment(productId, comment).subscribe(
      () => {
        this.commentForm.reset();
        this.loadComments(productId); // Reload comments after adding a new one
      },
      (error) => {
        console.error('Error adding comment:', error);
      },
    );
  }


  // Update the list of comments for the current page
  updatePaginatedComments() {
    const startIndex = this.currentPage * this.pageSize;
    this.paginatedComments = this.comments.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  // Handle page change event in the paginator
  onPageChange(event: any) {
    this.currentPage = event.pageIndex;
    this.updatePaginatedComments();
  }

  // Emit an event to add the product to the wishlist
  addToWishlist(product: Product) {
    this.wishlistService.addToWishlist(product).subscribe({
      next: () => console.log(`${product.product_name} added to wishlist`),
      error: (err) => console.error('Failed to add to wishlist:', err),
    });
  }

  // Emit an event to add the product to the cart

  // Directly calls the cart service to add the product to cart, removing the event emitter
  addToCart(selectedSize: ProductSize | null, color: string): void {
    // Check if product data is valid
    if (!this.product) {
      console.error('Product is required but was not provided.');
      return;
    }

    // Check if the size is valid
    if (!selectedSize) {
      console.error('Selected size is required but was not provided.');
      return;
    }

    // Determine quantity, defaulting to 1 if none provided
    const purchaseQuantity = this.userSelectedQuantity || 1;
    if (purchaseQuantity <= 0) {
      console.error('Invalid purchase quantity:', purchaseQuantity);
      return;
    }

    // Directly contacting the cart service
    console.log('Directly contacting cart service to add product:', {
      product: this.product,
      selectedSize,
      color,
      purchaseQuantity
    });

    this.cartService.addToCart(this.product, selectedSize, color, purchaseQuantity).subscribe({
      next: () => {
        console.log(`Product added to cart successfully: ${this.product.product_name}`);
      },
      error: (err) => {
        console.error('Error adding product to cart:', err);
      }
    });
  }

  // Method to update the main image when a thumbnail is clicked
  setMainImage(image: string) {
    this.currentImage = image;
  }

  formatDate(date: any) {
    return this.dateService.formatDate(date);
  }
  // Get the relevant unit
  getUnit(unitType: 'size' | 'waist' | 'length' | 'fit' | 'kidsSize' | 'chest' | 'sleeve', size: number | string, sizeLabel: string): string {
    return this.productService.getUnit(unitType, size, sizeLabel);
  }

}
