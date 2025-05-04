import {Component, OnInit} from '@angular/core';
import {ProductService} from '../services/product.service';
import {PostsService} from '../services/posts.service';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrl: './provider.component.sass',
})

export class ProviderComponent implements OnInit {
  products: any[] = [];  // Array to hold fetched products
  posts: any[] = [];  // Array to hold fetched posts

  constructor(private productService: ProductService,
              private postService: PostsService) {
  }

  ngOnInit(): void {
    // Subscribe to the products observable and assign the result to the products array
    this.productService.getProducts().subscribe(
      (products) => {
        this.products = products;  // Assign the fetched products to the array
        console.log('Fetched products:', this.products);
      },
      (error) => {
        console.error('Error fetching products:', error);
      },
    );
    this.postService.getPosts().subscribe(
      (posts) => {
        this.posts = posts;  // Assign the fetched products to the array
        console.log('Fetched posts:', this.posts);
      },
      (error) => {
        console.error('Error fetching posts:', error);
      },
    );
  }
}
