import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrl: './storage.component.sass',
})
export class StorageComponent {
  // @ts-ignore
  imageUrl$: Observable<string>;

  constructor(private storageService: StorageService) {}

  ngOnInit() {
    const filePath = 'path/to/your/image.jpg'; // Replace with your actual file path in Firebase Storage
    this.imageUrl$ = this.storageService.getImageUrl(filePath);
  }
}
