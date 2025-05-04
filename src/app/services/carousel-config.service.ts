import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarouselConfigService {

  // Key to use for storing the height in localStorage
  private readonly LOCAL_STORAGE_KEY = 'carouselImageHeight';

  // BehaviorSubject to hold and emit the max-height value, initialized directly to avoid undefined errors
  private imageHeightSource: BehaviorSubject<number>;

  // Observable that components can subscribe to for changes to image height
  imageHeight$;

  constructor() {
    // Attempt to retrieve the stored height value from localStorage
    const storedHeight = localStorage.getItem(this.LOCAL_STORAGE_KEY);

    // If a value exists in localStorage, parse it as an integer; otherwise, use the default value of 700
    const initialHeight = storedHeight ? parseInt(storedHeight, 10) : 700;

    // Initialize the BehaviorSubject with the initial height (either from localStorage or the default value)
    this.imageHeightSource = new BehaviorSubject<number>(initialHeight);

    // Expose the BehaviorSubject as an observable for external subscription
    this.imageHeight$ = this.imageHeightSource.asObservable();
  }

  /**
   * Updates the max-height value and persists it in localStorage
   * @param height - The new height to be set
   */
  setImageHeight(height: number): void {
    // Update the current value in the BehaviorSubject
    this.imageHeightSource.next(height);

    // Store the updated height value in localStorage for persistence across sessions
    localStorage.setItem(this.LOCAL_STORAGE_KEY, height.toString());
  }
}
