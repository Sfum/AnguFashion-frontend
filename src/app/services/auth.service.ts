import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {catchError, map, Observable, of, switchMap, throwError} from 'rxjs';
import {SnackbarService} from './snackbar.service';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {User} from '../models/user'; //
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${environment.apiUrl}/users`; // Use apiUrl from environment

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    public snackbarService: SnackbarService,
    private httpClient: HttpClient
  ) {
    // ============================
    // Observing the Firebase auth state and mapping it to the custom User model
    // ============================
    this.user$ = afAuth.authState as Observable<User | null>;
    this.user$ = afAuth.authState.pipe(
      map((firebaseUser) => this.mapFirebaseUserToUser(firebaseUser)), // Transform Firebase user to custom User object
    ) as Observable<User | null>;
  }

  // ============================
  // Observable that tracks the authenticated user state
  // ============================
  user$: Observable<User | null> = this.afAuth.authState as Observable<User | null>;

  // ============================
  // Helper function to map Firebase's user object to the custom User interface
  // ============================
  private mapFirebaseUserToUser(firebaseUser: firebase.User | null): User | null {
    // Return null if no user is authenticated
    if (!firebaseUser) {
      return null;
    }
    return {
      brand_description: '',
      brand_name: '',
      emailVerified: false,
      isAnonymous: false,
      metadata: undefined,
      multiFactor: undefined,
      phoneNumber: '',
      photoURL: '',
      providerData: [],
      providerId: '',
      refreshToken: '',
      tenantId: '',
      user_email: '',
      delete(): Promise<void> {
        return Promise.resolve(undefined);
      },
      getIdToken(forceRefresh?: boolean): Promise<string> {
        return Promise.resolve('');
      },
      getIdTokenResult(forceRefresh?: boolean): Promise<firebase.auth.IdTokenResult> {
        return Promise.resolve(undefined);
      },
      linkAndRetrieveDataWithCredential(credential: firebase.auth.AuthCredential): Promise<firebase.auth.UserCredential> {
        return Promise.resolve(undefined);
      },
      linkWithCredential(credential: firebase.auth.AuthCredential): Promise<firebase.auth.UserCredential> {
        return Promise.resolve(undefined);
      },
      linkWithPhoneNumber(phoneNumber: string, applicationVerifier: firebase.auth.ApplicationVerifier): Promise<firebase.auth.ConfirmationResult> {
        return Promise.resolve(undefined);
      },
      linkWithPopup(provider: firebase.auth.AuthProvider): Promise<firebase.auth.UserCredential> {
        return Promise.resolve(undefined);
      },
      linkWithRedirect(provider: firebase.auth.AuthProvider): Promise<void> {
        return Promise.resolve(undefined);
      },
      reauthenticateAndRetrieveDataWithCredential(credential: firebase.auth.AuthCredential): Promise<firebase.auth.UserCredential> {
        return Promise.resolve(undefined);
      },
      reauthenticateWithCredential(credential: firebase.auth.AuthCredential): Promise<firebase.auth.UserCredential> {
        return Promise.resolve(undefined);
      },
      reauthenticateWithPhoneNumber(phoneNumber: string, applicationVerifier: firebase.auth.ApplicationVerifier): Promise<firebase.auth.ConfirmationResult> {
        return Promise.resolve(undefined);
      },
      reauthenticateWithPopup(provider: firebase.auth.AuthProvider): Promise<firebase.auth.UserCredential> {
        return Promise.resolve(undefined);
      },
      reauthenticateWithRedirect(provider: firebase.auth.AuthProvider): Promise<void> {
        return Promise.resolve(undefined);
      },
      reload(): Promise<void> {
        return Promise.resolve(undefined);
      },
      sendEmailVerification(actionCodeSettings?: firebase.auth.ActionCodeSettings | null): Promise<void> {
        return Promise.resolve(undefined);
      },
      toJSON(): Object {
        return undefined;
      },
      unlink(providerId: string): Promise<firebase.User> {
        return Promise.resolve(undefined);
      },
      updateEmail(newEmail: string): Promise<void> {
        return Promise.resolve(undefined);
      },
      updatePassword(newPassword: string): Promise<void> {
        return Promise.resolve(undefined);
      },
      updatePhoneNumber(phoneCredential: firebase.auth.AuthCredential): Promise<void> {
        return Promise.resolve(undefined);
      },
      updateProfile(profile: { displayName?: string | null; photoURL?: string | null }): Promise<void> {
        return Promise.resolve(undefined);
      },
      verifyBeforeUpdateEmail(newEmail: string, actionCodeSettings?: firebase.auth.ActionCodeSettings | null): Promise<void> {
        return Promise.resolve(undefined);
      },
      uid: firebaseUser.uid, // Unique user ID
      email: firebaseUser.email || '', // User's email address
      displayName: firebaseUser.displayName || '', // Display name of the user
      // @ts-ignore
      photoUrl: firebaseUser.photoURL || '', // User's profile photo URL
      address: '', // Default or custom address
      postcode: '', // Default or custom postcode
      country: '', // Default or custom country
      is_brand: false, // Default to false or customize as needed
      role: '', // User's role, default or fetched from elsewhere
      brandId: 0 // Default brand ID, can be updated if the user is associated with a brand
    };
  }

  // ============================
  // Fetch the current authenticated user as an observable
  // ============================
  getCurrentUser(): Observable<User | null> {
    return this.afAuth.authState.pipe(
      switchMap(firebaseUser => {
        if (!firebaseUser) return of(null);

        const uid = firebaseUser.uid;

        // Call your backend API to get the full profile by UID
        return this.httpClient.get<User>(`${this.apiUrl}/${uid}`).pipe(
          map(profile => {
            // Merge Firebase user data with backend profile
            return {
              ...this.mapFirebaseUserToUser(firebaseUser), // base Firebase mapping
              ...profile // override with backend profile (e.g., country, role, etc.)
            } as User;
          }),
          catchError(err => {
            console.error('Failed to fetch backend user profile:', err);
            return of(this.mapFirebaseUserToUser(firebaseUser)); // fallback to Firebase-only user
          })
        );
      })
    );
  }


  // ============================
  // Function to handle user sign-in using email and password
  // ============================
  async signIn(email: string, password: string) {
    try {
      await this.afAuth
        .signInWithEmailAndPassword(email, password) // Sign in using Firebase Authentication
      ;
      // Show success message after successful sign-in
      this.snackbarService.showSnackbar(`Welcome, you have been logged in!`);
    } catch (error) {
      // Show error message if sign-in fails
      this.snackbarService.showSnackbar(`Sign In failed!`);
    }
  }

  // ============================
  // Function to handle user sign-up with additional user data
  // ============================
  signUp(
    email: string,
    password: string,
    displayName: string,
    photoURL: string,
    address: string,
    postcode: string,
    country: string,
    isContentProvider: boolean, // Flag to check if the user is a content provider (brand)
    brand_name: string, // Brand name for content providers
    brand_description: string, // Brand description for content providers
  ) {
    return new Promise<void>((resolve, reject) => {
      this.afAuth
        .createUserWithEmailAndPassword(email, password) // Create user with email and password
        .then(async (userCredential) => {
          const user = userCredential.user; // Get the created user

          if (!user) {
            throw new Error('User not found after creation'); // Handle missing user error
          }

          // Update the user's profile with display name and photo URL
          await user
            .updateProfile({
              displayName: displayName,
              photoURL: photoURL,
            });
          return user; // Ensure user is returned for further processing
        })
        .then((user) => {
          // Prepare user data to store in Firestore
          let userData: any = {
            uid: user.uid, // User's unique ID
            user_email: email, // Copy email to user_email
            displayName: displayName, // User's display name
            photoURL: photoURL, // User's profile photo URL
            address: address, // User's address
            postcode: postcode, // User's postcode
            country: country, // User's country
            role: 'user', // Default role is 'user'
          };

          // If the user is a content provider (brand)
          if (isContentProvider) {
            const randomId = this.generateRandomId(); // Generate random ID for the brand

            const brandData = {
              id: randomId, // Generated brand ID
              brand_name: brand_name, // Brand name
              brand_description: brand_description, // Brand description
              createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Timestamp of brand creation
              moderators: [user.uid], // Assign the user as a brand moderator
            };

            // Add the brand data to the Firestore 'brands' collection
            return this.firestore
              .collection('brands')
              .add(brandData)
              .then((ref) => {
                // Update user data with brand-specific fields
                userData = {
                  ...userData,
                  role: 'brand', // Set the role to 'brand'
                  brandId: ref.id, // Brand document ID
                  brand_name: brand_name, // Brand name
                  brand_description: brand_description, // Brand description
                };

                // Store both user and brand data in Firestore
                return Promise.all([
                  this.firestore
                    .collection('users')
                    .doc(user.uid)
                    .set(userData), // Save user data in 'users' collection
                  this.firestore
                    .collection('brands')
                    .doc(ref.id)
                    .update({_id: ref.id, id: randomId}), // Update brand document with generated IDs
                ]).then(() => {
                }); // Ensure the final `then` returns void
              });
          } else {
            // If the user is not a content provider, just save user data
            return this.firestore
              .collection('users')
              .doc(user.uid)
              .set(userData)
              .then(() => {
              }); // Ensure the final `then` returns void
          }
        })
        .then(() => {
          resolve(); // Resolve the Promise when user signup completes
          this.snackbarService.showSnackbar('User signed up successfully!'); // Show success message
        })
        .catch((error) => {
          reject(error); // Reject the Promise in case of errors
          this.snackbarService.showSnackbar(`Sign Up failed: ${error.message}`); // Show error message
        });
    });
  }

  // ============================
  // Helper function to generate a random 6-digit ID (used for brand IDs)
  // ============================
  generateRandomId(): number {
    // Generate a random number between 100000 and 999999
    return Math.floor(100000 + Math.random() * 900000);
  }

  // ============================
  // Function to sign out the user
  // ============================
  async signOut() {
    await this.afAuth.signOut(); // Sign out using Firebase authentication
    window.location.reload(); // Reload the page after signing out
  }

  // ============================
  // Function to check if the current user is an admin
  // ============================
  isAdmin(): Observable<boolean> {
    return this.user$.pipe(
      map((user) => user && user.email === 'admin@angufashion.com'), // Return true if the user is the admin
    );
  }

  // ============================
  // Function to check if the current user is a moderator
  // ============================
  isModerator(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      switchMap((user) => {
        if (!user) {
          return of(false); // Return false if no user is logged in
        } else {
          // Check the 'users' collection in Firestore for the user's role
          return this.firestore
            .collection('users')
            .doc(user.uid)
            .valueChanges()
            .pipe(
              switchMap((userData: any) => {
                if (userData?.role === 'brand') {
                  return of(true); // Return true if the user's role is 'brand'
                } else {
                  return of(false); // Return false if the user is not a moderator
                }
              }),
            );
        }
      }),
    );
  }

  // ============================
  // Fetch all users from the Firestore 'users' collection
  // ============================
  getAllUsers(): Observable<User[]> {
    // Make an HTTP GET request to the backend API to fetch all users
    // Ensure the API URL is correctly formatted and accessible
    return this.httpClient.get<User[]>(`${this.apiUrl}`)
      .pipe(
        // Use RxJS operators for error handling if needed
        catchError((error) => {
          console.error('Error fetching users:', error); // Log the error for debugging
          return throwError(() => new Error('Failed to fetch users from the server.'));
        })
      );
  }
  async getToken(): Promise<string | null> {
    return this.afAuth.currentUser
      .then(user => user ? user.getIdToken() : null)
      .catch(error => {
        console.error('Error fetching Firebase token:', error);
        return null;
      });
  }
  updateUserAddress(userId: string, address: { address: string, postcode: string, country: string }): Observable<void> {
    return this.httpClient.put<void>(`${this.apiUrl}/${userId}/update-address`, address).pipe(
      catchError(error => {
        console.error('Failed to update user address:', error);
        return throwError(() => new Error('Failed to update address.'));
      })
    );
  }


}
