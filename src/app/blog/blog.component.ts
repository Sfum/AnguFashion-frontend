import { Component, OnInit } from '@angular/core';
import { PostsService } from '../services/posts.service';  // Import the PostsService for data operations
import { Post } from '../models/post';  // Import the Post model to type the posts array

@Component({
  selector: 'app-blog',  // Selector for the component
  templateUrl: './blog.component.html',  // Path to the component’s HTML template
  styleUrls: ['./blog.component.sass'],  // Path to the component’s stylesheet
})
export class BlogComponent implements OnInit {
  
  posts: Post[] = [];  // Array to hold the list of posts

  constructor(private postsService: PostsService) {}  // Inject PostsService to fetch posts

  ngOnInit(): void {
    // Fetch posts from Firestore using the PostsService
    this.postsService.getPosts().subscribe((data: Post[]) => {
      this.posts = data;  // Assign fetched posts to the component’s posts array
    });
  }
}
