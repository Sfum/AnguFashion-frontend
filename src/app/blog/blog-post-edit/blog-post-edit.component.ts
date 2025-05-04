


import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { Post } from '../../models/post'; // Import the Post model
import { PostsService } from '../../services/posts.service'; // Import the PostsService for CRUD operations
import { ActivatedRoute, Router } from '@angular/router'; // Import for routing and retrieving route parameters
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Import Firebase Storage for file uploads
import {finalize, map} from 'rxjs/operators'; // Import finalize operator for handling observable completion

@Component({
  selector: 'app-blog-post-edit',
  templateUrl: './blog-post-edit.component.html',
  styleUrls: ['./blog-post-edit.component.sass'],
})
export class BlogPostEditComponent implements OnInit {
  postForm: FormGroup; // FormGroup for managing the form state
  postId!: string; // Post ID retrieved from the route
  selectedImage: File | null = null; // Holds the selected image file for upload
  uploadPercent: Observable<number> | undefined; // Observable for tracking the upload progress
  existingImageUrl: string | undefined; // Stores the existing image URL of the post
  postEdit$: Observable<Post[]>;

  constructor(
    private fb: FormBuilder, // Inject FormBuilder to build the form
    private postService: PostsService, // Inject PostsService to interact with post data
    private route: ActivatedRoute, // Inject ActivatedRoute to get route parameters
    private router: Router, // Inject Router to navigate to other routes
    private storage: AngularFireStorage, // Inject AngularFireStorage for image uploads
  ) {
    // Initialize the form with empty values
    this.postForm = this.fb.group({
      post_name: [''],
      post_content: [''],
    });
    // Get the list of posts
    this.postEdit$ = this.postService.getPosts();
  }

  ngOnInit(): void {
    // Retrieve the post ID from the route parameters
    this.postId = this.route.snapshot.paramMap.get('_id')!;
    // Load the post details
    this.loadPost();
  }

  // Load the post details and populate the form
  loadPost() {
    this.postService.getPost(this.postId).subscribe(
      (post) => {
        if (post) {
          const { id, ...postData } = post;
          this.postForm.patchValue(postData); // Patch the form with existing post data
          this.existingImageUrl = post.imageUrl; // Store the existing image URL
        } else {
          console.error('Post not found'); // Handle post not found
        }
      },
      (error) => {
        console.error('Error retrieving post: ', error); // Handle retrieval error
      },
    );
  }

  // Handle image file selection
  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0]; // Store the selected image file
    }
  }

  // Handle form submission
  onSubmit() {
    if (this.postForm.valid) {
      const formData = new FormData();
      formData.append('post_name', this.postForm.get('post_name')?.value || '');
      formData.append('post_content', this.postForm.get('post_content')?.value || '');

      // Check if a new image is selected
      if (this.selectedImage) {
        const filePath = `post_images/${this.selectedImage.name}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, this.selectedImage);
        this.uploadPercent = uploadTask.percentageChanges().pipe(
          map((percent) => percent ?? 0) // Ensure uploadPercent is Observable<number>
        );

        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe((url) => {
              formData.append('imageUrl', url);
              const postData = this.formDataToObject(formData); // Convert to plain object
              this.updatePost(postData); // Update the post
            });
          }),
        ).subscribe();
      } else {
        // No new image selected, use the existing image URL
        if (this.existingImageUrl) {
          formData.append('imageUrl', this.existingImageUrl);
        }
        const postData = this.formDataToObject(formData); // Convert to plain object
        this.updatePost(postData); // Update the post
      }
    } else {
      console.log('Form is invalid. Please fill in all required fields.');
    }
  }


  // Helper function to convert FormData to a plain object
  private formDataToObject(formData: FormData): Partial<Post> {
    const obj: any = {};
    formData.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  // Update the post with new data
  private updatePost(postData: Partial<Post>) {
    this.postService.updatePost(this.postId, postData).subscribe(
      () => {
        this.router.navigate(['/posts-list']); // Navigate to the posts list page after updating
      },
      (error) => {
        console.error('Error updating post: ', error); // Handle update error
      },
    );
  }
}
