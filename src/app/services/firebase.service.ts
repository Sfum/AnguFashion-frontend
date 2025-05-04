import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private afs: AngularFirestore, // Injects the AngularFirestore service for Firestore interactions
    private auth: AngularFireAuth, // Injects the AngularFireAuth service for authentication
  ) {

    // If the environment is set to use emulators (for local development/testing)
    if (environment.useEmulators) {
      // Configure Firestore to use the local emulator
      this.afs.firestore.settings({
        host: 'localhost:8080', // Local emulator host
        ssl: false, // Disable SSL for the local emulator
      });
      // Configure Firebase Auth to use the local emulator
      this.auth.useEmulator('http://localhost:9099'); // Local emulator URL for Auth
    }
  }
}
