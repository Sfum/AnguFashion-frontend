import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProductEditComponent} from './products/product-edit/product-edit.component';
import {ProductAddComponent} from './products/product-add/product-add.component';
import {WishlistComponent} from './wishlist/wishlist.component';
import {ShoppingCartComponent} from './shopping-cart/shopping-cart.component';
import {LoginComponent} from './auth/login/login.component';
import {SignupComponent} from './auth/signup/signup.component';
import {CategoriesComponent} from './categories/categories.component';
import {BundlesComponent} from './bundles/bundles.component';
import {ProviderComponent} from './provider/provider.component';
import {BrandsComponent} from './brands/brands.component';
import {HomeComponent} from './home/home.component';
import {LogoutComponent} from './auth/logout/logout.component';
import {ProductPageDetailComponent} from './products/product-page/product-page-detail/product-page-detail.component';
import {BrandAddComponent} from './brands/brand-add/brand-add.component';
import {BrandEditComponent} from './brands/brand-edit/brand-edit.component';
import {CategoryEditComponent} from './categories/category-edit/category-edit.component';
import {CategoryAddComponent} from './categories/category-add/category-add.component';
import {ProfileComponent} from './auth/profile/profile.component';
import {AdminGuard} from './guards/admin.guard';
import {BrandListComponent} from './brands/brand-list/brand-list.component';
import {CategoryListComponent} from './categories/category-list/category-list.component';
import {OnSaleComponent} from './on-sale/on-sale.component';
import {OnSaleBrandComponent} from './on-sale/on-sale-brand/on-sale-brand.component';
import {OnSaleCategoryComponent} from './on-sale/on-sale-category/on-sale-category.component';
import {PaymentComponent} from './shopping-cart/payment/payment.component';
import {AdminReportComponent} from './reports/admin-report/admin-report.component';
import {ModeratorReportComponent} from './reports/moderator-report/moderator-report.component';
import {DownloadReportComponent} from './reports/download-report/download-report.component';
import {BlogComponent} from './blog/blog.component';
import {BlogAddPostComponent} from './blog/blog-add-post/blog-add-post.component';
import {BlogPostListComponent} from './blog/blog-post-list/blog-post-list.component';
import {BlogDetailComponent} from './blog/blog-detail/blog-detail.component';
import {BlogPostEditComponent} from './blog/blog-post-edit/blog-post-edit.component';
import {BlogPostPageComponent} from './blog/blog-post-page/blog-post-page.component';
import {ProductTicketPanelComponent} from './products/product-ticket-panel/product-ticket-panel.component';
import {ProductAddLandingComponent} from './products/product-add-landing/product-add-landing.component';
import {CompareComponent} from './compare/compare.component';
import {BlogAddPostLandingComponent} from './blog/blog-add-post-landing/blog-add-post-landing.component';
import {ProductListComponent} from './products/product-list/product-list.component';
import {VatSummaryComponent} from './vat-summary/vat-summary.component';
import {VatRateComponent} from './vat-rate/vat-rate.component';
import {DeliveryRateComponent} from './delivery-rate/delivery-rate.component';

const routes: Routes = [
  {path: '', redirectTo: '', pathMatch: 'full'},
  {path: '', component: HomeComponent},
  {path: 'categories', component: CategoriesComponent},
  {path: 'brands', component: BrandsComponent},
  {path: 'bundles', component: BundlesComponent},
  {
    path: 'manage-products',
    component: ProviderComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'manage-brands',
    component: BrandListComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'manage-categories',
    component: CategoryListComponent,
    canActivate: [AdminGuard],
  },
  {path: 'products/:id', component: ProductPageDetailComponent},
  {path: 'add-product', component: ProductAddComponent},
  {path: 'add-product-landing', component: ProductAddLandingComponent},
  {path: 'edit/:id', component: ProductEditComponent},
  {
    path: 'add-brand',
    component: BrandAddComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'brand-edit/:_id',
    component: BrandEditComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'add-category',
    component: CategoryAddComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'category-edit/:id',
    component: CategoryEditComponent,
    canActivate: [AdminGuard],
  },
  {path: 'wishlist', component: WishlistComponent},
  {path: 'shopping-cart', component: ShoppingCartComponent},
  {path: 'login', component: LoginComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'on-sale', component: OnSaleComponent},
  {path: 'blog', component: BlogComponent},
  {path: 'on-sale-brand', component: OnSaleBrandComponent},
  {path: 'on-sale-category', component: OnSaleCategoryComponent},
  {path: 'checkout', component: PaymentComponent},
  {path: 'compare', component: CompareComponent},
  {path: 'admin-report', component: AdminReportComponent},
  {path: 'moderator-report', component: ModeratorReportComponent},
  {path: 'orders', component: DownloadReportComponent},
  {path: 'payment', component: PaymentComponent},
  {path: 'tickets', component: ProductTicketPanelComponent},
  {path: 'add-post', component: BlogAddPostComponent},
  {path: 'add-post-landing', component: BlogAddPostLandingComponent},

  {path: 'add-post', component: BlogAddPostComponent},
  {path: 'post-detail', component: BlogDetailComponent},
  {path: 'posts-list', component: BlogPostListComponent},
  {path: 'post-edit/:_id', component: BlogPostEditComponent},
  {path: 'post-page/:_id', component: BlogPostPageComponent},
  {path: 'vat-summary', component: VatSummaryComponent},
  {path: 'vat-rate', component: VatRateComponent},
  {path: 'delivery', component: DeliveryRateComponent},
  {
    path: 'dashboard', // Parent route
    component: ProviderComponent, // Parent layout with menu
    children: [
      { path: 'manage-products', component: ProductListComponent },
      { path: 'admin-report', component: AdminReportComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}

export {routes};
