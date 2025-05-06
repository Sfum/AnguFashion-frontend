import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { PostsService } from '../../services/posts.service';

@Component({
  selector: 'app-provider-menu',
  templateUrl: './provider-menu.component.html',
  styleUrls: ['./provider-menu.component.sass']
})
export class ProviderMenuComponent implements OnInit {
  products: any[] = [];
  posts: any[] = [];

  constructor(
    private productService: ProductService,
    private postService: PostsService
  ) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(
      (products) => this.products = products,
      (error) => console.error('Error fetching products:', error)
    );

    this.postService.getPosts().subscribe(
      (posts) => this.posts = posts,
      (error) => console.error('Error fetching posts:', error)
    );
  }
}
