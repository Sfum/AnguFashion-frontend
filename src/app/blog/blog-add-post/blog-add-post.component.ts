import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AngularFireStorage} from '@angular/fire/compat/storage';
import {finalize} from 'rxjs/operators';
import {v4 as uuidv4} from 'uuid';
import {PostsService} from '../../services/posts.service';
import {AuthService} from '../../services/auth.service';
import {Post} from '../../models/post';
import {SnackbarService} from '../../services/snackbar.service';

@Component({
  selector: 'app-blog-add-post',
  templateUrl: './blog-add-post.component.html',
  styleUrls: ['./blog-add-post.component.sass'],
})
export class BlogAddPostComponent implements OnInit {
  postForm: FormGroup; // FormGroup for the post form
  imageFile: File | null = null; // Holds the selected image file
  imagePreview: string | null = null; // Holds the URL for the image preview
  userId: string | null = null; // Store the UID of the logged-in user

  constructor(
    private formBuilder: FormBuilder, // Inject FormBuilder to build the form
    private postService: PostsService, // Inject PostsService to interact with post data
    private storage: AngularFireStorage, // Inject Firebase Storage service for image uploads
    private authService: AuthService, // Inject AuthService to get user information
    private router: Router, // Inject Router to navigate to other routes
    private snackbarService: SnackbarService
  ) {
    // Initialize form with default values and validators
    this.postForm = this.formBuilder.group({
      _id: [''],
      post_name: ['', Validators.required],
      post_content: ['', Validators.required],
      imageUrl: [''],
      post_date: [new Date(), Validators.required], // Default post date to today
    });
  }

  ngOnInit(): void {
    // Fetch the currently logged-in user's UID
    this.authService.getCurrentUser().subscribe((user) => {
      if (user) {
        this.userId = user.uid; // Store the UID in userId
      }
    });
  }

  // Handle file selection and preview
  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0]; // Get the selected file
    if (file) {
      this.imageFile = file;

      // Create a FileReader to preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string; // Set imagePreview to the file URL
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  }

  // Handle form submission
  onSubmit(): void {
    if (this.postForm.valid && this.userId) {
      const formValue = this.postForm.value;
      const newPost: Post = {
        // @ts-ignore
        _id: formValue._id,
        post_name: formValue.post_name,
        post_content: formValue.post_content,
        userId: this.userId, // Include the user's UID
        imageUrl: formValue.imageUrl,
        post_date: formValue.post_date ? new Date(formValue.post_date) : new Date(), // Ensure post_date is a Date object
      };

      // Upload image if selected
      if (this.imageFile) {
        this.uploadImage(this.imageFile).then((imageUrl) => {
          newPost.imageUrl = imageUrl; // Set the image URL in the post
          this.addPost(newPost); // Add the post to the service
        });
      } else {
        this.addPost(newPost); // Add the post without an image
        this.router.navigate(['/posts-list']);
      }
    } else {
      console.log('Form is invalid or user is not authenticated. Please fill in all required fields.');
    }
  }

  // Upload image to Firebase Storage
  uploadImage(file: File): Promise<string> {
    const filePath = `posts/${uuidv4()}`; // Generate a unique file path
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file); // Start the file upload

    return new Promise((resolve, reject) => {
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((downloadURL) => {
            resolve(downloadURL); // Return the download URL of the uploaded image
          }, (error) => {
            reject(error); // Handle errors
          });
        }),
      ).subscribe();
    });
  }

  // Add the post to the service and reset the form
  addPost(post: Post): void {
    this.postService.addPost(post).subscribe({
      next: () => {
        console.log('Post added successfully.');
        this.postForm.reset({
          post_date: new Date(), // Reset post_date to today's date
        });
        this.imageFile = null; // Clear the image file
        this.imagePreview = null; // Clear the image preview
        this.router.navigate(['/posts-list']); // Navigate to the posts list page
      },
      error: (error: any) => {
        console.error('Error adding post:', error); // Handle errors
        // Optionally, display an error message using SnackbarService
        this.snackbarService.showSnackbar('Failed to add post.');
      },
    });
  }
}
