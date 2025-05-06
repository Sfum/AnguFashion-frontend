import {CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {environment} from '../environments/environment';
import {RouterLink} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AppRoutingModule} from './app.routes';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AngularFireStorageModule} from '@angular/fire/compat/storage';
import {AngularFireDatabaseModule} from '@angular/fire/compat/database';
import {UsersAlsoBoughtComponent} from './users-also-bought/users-also-bought.component';
import {ProductCarouselComponent} from './products/product-carousel/product-carousel.component';
import {StorageComponent} from './storage/storage.component';
import {CommonModule} from '@angular/common';
import {ProductCardComponent} from './products/product-card/product-card.component';
import {ProductCardDetailComponent} from './products/product-card/product-card-detail/product-card-detail.component';
import {NavigationBarComponent} from './shared/navigation-bar/navigation-bar.component';
import {LogoBarComponent} from './shared/logo-bar/logo-bar.component';
import {HomeComponent} from './home/home.component';
import {CategoriesComponent} from './categories/categories.component';
import {BrandsComponent} from './brands/brands.component';
import {BundlesComponent} from './bundles/bundles.component';
import {ProductAddComponent} from './products/product-add/product-add.component';
import {ProductEditComponent} from './products/product-edit/product-edit.component';
import {ProductPageComponent} from './products/product-page/product-page.component';
import {ProviderComponent} from './provider/provider.component';
import {ShoppingCartComponent} from './shopping-cart/shopping-cart.component';
import {WishlistComponent} from './wishlist/wishlist.component';
import {BrandDetailComponent} from './brands/brand-detail/brand-detail.component';
import {CategoryDetailComponent} from './categories/category-detail/category-detail.component';
import {BundleDetailComponent} from './bundles/bundle-detail/bundle-detail.component';
import {LoginComponent} from './auth/login/login.component';
import {SignupComponent} from './auth/signup/signup.component';
import {LogoutComponent} from './auth/logout/logout.component';
import {BlogDetailComponent} from './blog/blog-detail/blog-detail.component';
import {ProductFilterComponent} from './products/product-filter/product-filter.component';
import {
  ProductFilterDetailComponent
} from './products/product-filter/product-filter-detail/product-filter-detail.component';
import {ProductPageDetailComponent} from './products/product-page/product-page-detail/product-page-detail.component';
import {BrandListComponent} from './brands/brand-list/brand-list.component';
import {CategoryEditComponent} from './categories/category-edit/category-edit.component';
import {BrandAddComponent} from './brands/brand-add/brand-add.component';
import {CategoryAddComponent} from './categories/category-add/category-add.component';
import {BrandEditComponent} from './brands/brand-edit/brand-edit.component';
import {CategoryListComponent} from './categories/category-list/category-list.component';
import {WishlistDetailComponent} from './wishlist/wishlist-detail/wishlist-detail.component';
import {BlogComponent} from './blog/blog.component';
import {PriceFilterComponent} from './products/product-filter/price-filter/price-filter.component';
import {ShoppingCartDetailComponent} from './shopping-cart/shopping-cart-detail/shopping-cart-detail.component';
import {ProfileComponent} from './auth/profile/profile.component';
import {ProductGridComponent} from './products/product-grid/product-grid.component';
import {OnSaleComponent} from './on-sale/on-sale.component';
import {ProductListComponent} from './products/product-list/product-list.component';
import {OnSaleDetailComponent} from './on-sale/on-sale-detail/on-sale-detail.component';
import {ShoppingCartPaymentComponent} from './shopping-cart/shopping-cart-payment/shopping-cart-payment.component';
import {OnSaleBrandComponent} from './on-sale/on-sale-brand/on-sale-brand.component';
import {OnSaleCategoryComponent} from './on-sale/on-sale-category/on-sale-category.component';
import {PaymentComponent} from './shopping-cart/payment/payment.component';
import {ProductListModeratorsComponent} from './products/product-list-moderators/product-list-moderators.component';
import {AdminReportComponent} from './reports/admin-report/admin-report.component';
import {ModeratorReportComponent} from './reports/moderator-report/moderator-report.component';
import {DownloadReportComponent} from './reports/download-report/download-report.component';
import {ProductTicketComponent} from './products/product-ticket/product-ticket.component';
import {InvoiceComponent} from './invoice/invoice.component';
import {BlogAddPostComponent} from './blog/blog-add-post/blog-add-post.component';
import {BlogPostEditComponent} from './blog/blog-post-edit/blog-post-edit.component';
import {BlogPostListComponent} from './blog/blog-post-list/blog-post-list.component';
import {BlogPostPageComponent} from './blog/blog-post-page/blog-post-page.component';
import {ProductTicketPanelComponent} from './products/product-ticket-panel/product-ticket-panel.component';
import {SortFilterComponent} from './products/product-filter/sort-filter/sort-filter.component';
import {ProductAddLandingComponent} from './products/product-add-landing/product-add-landing.component';
import {CompareComponent} from './compare/compare.component';
import {CompareDetailComponent} from './compare/compare-detail/compare-detail.component';
import {BlogAddPostLandingComponent} from './blog/blog-add-post-landing/blog-add-post-landing.component';
import {SizesFilterComponent} from './products/product-filter/sizes-filter/sizes-filter.component';
import {ColorFilterComponent} from './products/product-filter/color-filter/color-filter.component';
import {
  ProductCarouselUploaderComponent
} from './products/product-carousel/product-carousel-uploader/product-carousel-uploader.component';
import {TopChartsComponent} from './top-charts/top-charts.component';
import {SizeLabelFilterComponent} from './products/product-filter/size-label-filter/size-label-filter.component';
import {MatSortModule} from '@angular/material/sort';
import {MatDialogModule} from '@angular/material/dialog';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import {NgxPayPalModule} from 'ngx-paypal';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDrawer, MatDrawerContainer} from '@angular/material/sidenav';
import {MatCheckbox} from '@angular/material/checkbox';
import {
  MatButtonToggle,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {ThemeToggleComponent} from './shared/theme-toggle/theme-toggle.component';
import {MatCard, MatCardActions, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatInput} from '@angular/material/input';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatBadge} from '@angular/material/badge';

import {
  MatStep,
  MatStepLabel,
  MatStepper,
  MatStepperNext,
  MatStepperPrevious,
} from '@angular/material/stepper';
import {MatSlider} from '@angular/material/slider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  MatButton,
  MatFabButton,
  MatIconButton,
  MatMiniFabButton,
} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatChip, MatChipInput} from '@angular/material/chips';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {AngularFireModule} from '@angular/fire/compat';
import {AngularFireAuthModule} from '@angular/fire/compat/auth';
import {AngularFirestoreModule} from '@angular/fire/compat/firestore';
import {AuthInterceptor} from './services/auth.interceptor.service';
import {VatSummaryComponent} from './vat-summary/vat-summary.component';
import {DeliveryRateComponent} from './delivery-rate/delivery-rate.component';
import {VatRateComponent} from './vat-rate/vat-rate.component';
import {ProviderDataComponent} from './provider-data/provider-data.component';
import {ProviderMenuComponent} from './shared/provider-menu/provider-menu.component';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    AppComponent,
    ProductCardComponent,
    ProductCardDetailComponent,
    BrandDetailComponent,
    HomeComponent,
    NavigationBarComponent,
    LogoBarComponent,
    BrandsComponent,
    CategoriesComponent,
    BundlesComponent,
    ProductAddComponent,
    ProductEditComponent,
    ProductPageComponent,
    ProviderComponent,
    ShoppingCartComponent,
    BrandDetailComponent,
    WishlistComponent,
    CategoryDetailComponent,
    BundleDetailComponent,
    LoginComponent,
    SignupComponent,
    LogoutComponent,
    ProductListComponent,
    ProductFilterComponent,
    ProductFilterDetailComponent,
    ProductPageDetailComponent,
    BrandAddComponent,
    CategoryAddComponent,
    BrandEditComponent,
    CategoryListComponent,
    BrandListComponent,
    CategoryListComponent,
    CategoryEditComponent,
    WishlistDetailComponent,
    ProductCarouselComponent,
    ShoppingCartDetailComponent,
    ProfileComponent,
    StorageComponent,
    PriceFilterComponent,
    ProductGridComponent,
    OnSaleComponent,
    OnSaleDetailComponent,
    ShoppingCartPaymentComponent,
    OnSaleBrandComponent,
    OnSaleCategoryComponent,
    PaymentComponent,
    ProductListModeratorsComponent,
    AdminReportComponent,
    ModeratorReportComponent,
    DownloadReportComponent,
    ProductTicketComponent,
    InvoiceComponent,
    BlogComponent,
    BlogDetailComponent,
    ThemeToggleComponent,
    BlogAddPostComponent,
    BlogPostEditComponent,
    BlogPostListComponent,
    BlogPostPageComponent,
    ProductTicketPanelComponent,
    SortFilterComponent,
    ProductAddLandingComponent,
    CompareComponent,
    CompareDetailComponent,
    BlogAddPostLandingComponent,
    SizesFilterComponent,
    ColorFilterComponent,
    ProductCarouselUploaderComponent,
    UsersAlsoBoughtComponent,
    TopChartsComponent,
    SizeLabelFilterComponent,
    VatSummaryComponent,
    DeliveryRateComponent,
    VatRateComponent,
    ProviderDataComponent,
    ProviderMenuComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireAuthModule,
    RouterLink,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    MatButton,
    MatIcon,
    MatCard,
    MatLabel,
    MatFormField,
    MatSelect,
    MatInput,
    MatOption,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatDialogModule,
    MatTable,
    MatSortModule,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatPaginator,
    MatRow,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatSlideToggle,
    MatMiniFabButton,
    MatFabButton,
    MatBadge,
    MatStep,
    MatStepperPrevious,
    MatStepperNext,
    MatStepper,
    MatStepLabel,
    MatSlider,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSuffix,
    NgxPayPalModule,
    MatTooltip,
    MatTooltipModule,
    MatDrawerContainer,
    MatDrawer,
    MatIconButton,
    MatCheckbox,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatError,
    MatTabGroup,
    MatTab,
    MatCardHeader,
    MatCardContent,
    MatCardActions,
    HttpClientModule,
    MatProgressSpinner,
    MatChipInput,
    MatChip,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatCardTitle,
    MatExpansionModule,
    MatButtonModule

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  exports: [
    ProductCardComponent,
    BrandDetailComponent,
    NavigationBarComponent,
    LogoBarComponent,
    BrandListComponent,
    ProductFilterComponent,
    ProductGridComponent,
    AdminReportComponent,
    VatSummaryComponent,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {
}
