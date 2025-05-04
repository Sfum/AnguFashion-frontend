import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Subscription } from 'rxjs';
import {CarouselConfigService} from '../../services/carousel-config.service';

@Component({
  selector: 'app-product-carousel',
  templateUrl: './product-carousel.component.html',
  styleUrls: ['./product-carousel.component.sass'],
})
export class ProductCarouselComponent implements OnInit, OnDestroy {
  currentSlide = 0; // Index of the currently displayed slide
  slides: string[] = []; // Array to store dynamically fetched slide images
  intervalId: any; // Identifier for the interval timer
  storageSubscription: Subscription | undefined; // Subscription to manage Firebase Storage observables
  heightSubscription: Subscription | undefined;
  carouselImageHeight: number = 700; // Default height

  constructor(private storage: AngularFireStorage,
              private configService: CarouselConfigService) {}

  ngOnInit() {
    // Fetch image URLs from Firebase Storage and start the carousel
    this.fetchImages();

    // Set up an interval to automatically move to the next slide every 5 seconds
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
    // Subscribe to height updates from the shared service
    this.heightSubscription = this.configService.imageHeight$.subscribe(
      (newHeight) => {
        this.carouselImageHeight = newHeight;
      })
  }

  ngOnDestroy() {
    // Clear the interval when the component is destroyed to avoid memory leaks
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    if (this.storageSubscription) {
      this.storageSubscription.unsubscribe();
    }

    if (this.heightSubscription) {
      this.heightSubscription.unsubscribe();
    }
  }

  fetchImages() {
    // Fetch all image URLs from a specific Firebase Storage folder (e.g., 'carousel-images/')
    const folderPath = 'carousel-images/'; // Replace with your Firebase Storage folder path

    // List all files in the specified folder and retrieve their download URLs
    this.storageSubscription = this.storage
      .ref(folderPath)
      .listAll()
      .subscribe({
        next: (result) => {
          // Fetch and store download URLs for all files in the folder
          const downloadUrlPromises = result.items.map((itemRef) =>
            itemRef.getDownloadURL()
          );

          // Resolve all download URLs and update the slides array
          Promise.all(downloadUrlPromises).then((urls) => {
            this.slides = urls;
          });
        },
        error: (err) => {
          console.error('Error fetching images from Firebase Storage:', err);
        },
      });
  }

  nextSlide() {
    // Move to the next slide in the array, wrapping around to the start
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    // Move to the previous slide in the array, wrapping around to the end
    this.currentSlide =
      (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }
}
