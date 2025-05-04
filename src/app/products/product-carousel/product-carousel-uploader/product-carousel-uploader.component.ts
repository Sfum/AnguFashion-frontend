import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {CarouselConfigService} from '../../../services/carousel-config.service';

export interface ImageData {
  name: string; // Displayable name of the image
  path: string; // Firebase storage path
  url: string;  // Hidden URL of the image
}

@Component({
  selector: 'app-product-carousel-uploader',
  templateUrl: './product-carousel-uploader.component.html',
  styleUrls: ['./product-carousel-uploader.component.sass'],
})
export class ProductCarouselUploaderComponent implements OnInit {
  displayedColumns: string[] = ['preview', 'name', 'actions']; // Columns to display in the Material Table
  dataSource: ImageData[] = []; // Data for the table
  folderPath = 'carousel-images/'; // Firebase folder to store images
  uploadProgress: number | null = null; // To track upload progress
  slides: string[] = []; // Array to hold carousel images
  currentSlide = 0; // Current slide index
  carouselImageHeight: number = 700; // Default max height for carousel images

  constructor(private storage: AngularFireStorage,
              private configService: CarouselConfigService) {}

  ngOnInit() {
    this.fetchAvailableImages(); // Fetch all images on initialization
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => this.uploadFile(file));
    }
  }

  uploadFile(file: File) {
    const uniqueFileName = `${this.folderPath}${file.name}`; // Use the folder path and file name
    const fileRef = this.storage.ref(uniqueFileName);
    const uploadTask = this.storage.upload(uniqueFileName, file);

    // Track upload progress
    uploadTask.percentageChanges().subscribe((progress) => {
      this.uploadProgress = progress;
    });

    // Refresh the image list after upload
    uploadTask
      .snapshotChanges()
      .toPromise()
      .then(() => {
        this.fetchAvailableImages(); // Refresh the table data
        this.uploadProgress = null; // Reset progress
      })
      .catch((err) => {
        console.error('Error uploading file:', err);
        this.uploadProgress = null;
      });
  }

  fetchAvailableImages() {
    const storageRef = this.storage.ref(this.folderPath);
    storageRef
      .listAll()
      .toPromise()
      .then((res) => {
        const items = res.items;
        const imagePromises = items.map((item) =>
          item.getDownloadURL().then((url) => ({
            name: item.name, // Extract just the file name
            path: item.fullPath,
            url,
          }))
        );

        return Promise.all(imagePromises);
      })
      .then((images) => {
        this.dataSource = images; // Update the table data
      })
      .catch((err) => {
        console.error('Error fetching available images:', err);
      });
  }

  deleteImage(imagePath: string) {
    const fileRef = this.storage.ref(imagePath);
    fileRef
      .delete()
      .toPromise()
      .then(() => {
        this.fetchAvailableImages(); // Refresh the table data after deletion
      })
      .catch((err) => console.error('Error deleting file:', err));
  }

  // Method to navigate to the previous slide
  prevSlide(): void {
    this.currentSlide = (this.currentSlide > 0) ? this.currentSlide - 1 : this.slides.length - 1;
  }

  // Method to navigate to the next slide
  nextSlide(): void {
    this.currentSlide = (this.currentSlide < this.slides.length - 1) ? this.currentSlide + 1 : 0;
  }
  // Method to update the max height for carousel images
  updateCarouselImageHeight(): void {
    if (this.carouselImageHeight < 100) {
      alert('Height must be at least 100px!');
      return;
    }

    // Update the value in the shared service
    this.configService.setImageHeight(this.carouselImageHeight);

    alert(`Carousel image height updated to ${this.carouselImageHeight}px`);
  }
}
