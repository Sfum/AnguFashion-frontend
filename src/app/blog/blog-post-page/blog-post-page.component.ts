import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostsService } from '../../services/posts.service'; // Import PostsService for data operations
import { Post } from '../../models/post';  // Import the Post model

@Component({
  selector: 'app-blog-post-page',
  templateUrl: './blog-post-page.component.html',
  styleUrls: ['./blog-post-page.component.sass'],  // Correct spelling: styleUrls, not styleUrl
})
export class BlogPostPageComponent implements OnInit {

  post: Post | undefined;  // Variable to hold the post data
  errorMessage: string | undefined;  // Variable to hold error messages

  constructor(
    private route: ActivatedRoute,   // Inject ActivatedRoute to access route parameters
    private postsService: PostsService,  // Inject PostsService to fetch post data
  ) {}

  ngOnInit(): void {
    // Get the post ID from the route parameters
    const postId = this.route.snapshot.paramMap.get('_id');  // Retrieve the post ID from the route snapshot

    if (postId) {
      // Fetch the post using the postId from PostsService
      this.postsService.getPost(postId).subscribe({
        next: (data) => {
          if (data) {
            this.post = data;  // Assign the fetched post data to the local 'post' variable
          } else {
            this.errorMessage = 'Post not found';  // Set error message if post data is not found
          }
        },
        error: (error) => {
          console.error('Error fetching post:', error);  // Log the error to the console
          this.errorMessage = 'Failed to load post. Please try again later.';  // Set a user-friendly error message
        },
      });
    } else {
      this.errorMessage = 'No post ID provided.';  // Set error message if no post ID is provided in the route
    }
  }
}
