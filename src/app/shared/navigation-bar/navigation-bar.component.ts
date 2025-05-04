import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.sass'],
})
export class NavigationBarComponent implements OnInit {
  user$: Observable<firebase.User> | undefined;
  filteredProducts$: Observable<Product[]> | undefined;
  isAdmin$: Observable<boolean> | undefined;
  isModerator$: Observable<boolean> | undefined;

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private router: Router,
  ) {}

  ngOnInit() {
    // @ts-ignore
    this.user$ = this.authService.user$;
    this.isAdmin$ = this.authService.isAdmin();
    this.isModerator$ = this.authService.isModerator();
    this.filteredProducts$ = this.productService.filteredProductsQuery$;
  }

  onSearch(event: Event) {
    const query = (event.target as HTMLInputElement).value;
    this.productService.setSearchQuery(query);
    console.log('Search query set to:', query);
    this.router.navigate(['/']);
  }
}
