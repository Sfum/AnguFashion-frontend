import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Post } from '../../models/post'; // Import the Post model
import { MatPaginator } from '@angular/material/paginator'; // Import paginator for pagination
import { PostsService } from '../../services/posts.service'; // Import PostsService to handle CRUD operations
import { SnackbarService } from '../../services/snackbar.service'; // Import SnackbarService for user notifications

@Component({
  selector: 'app-blog-post-list',
  templateUrl: './blog-post-list.component.html',
  styleUrls: ['./blog-post-list.component.sass'],
})
export class BlogPostListComponent implements OnInit {
  displayedColumns: string[] = [
    'post_name',
    'post_date',
    'post_content',
    'delete',
  ];
  // Data source for the table, initialized later
  dataSource: MatTableDataSource<Post> = new MatTableDataSource<Post>();
  posts: Post[] = []; // Array to store the list of posts

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined; // Reference to MatPaginator for table pagination

  constructor(
    private postsService: PostsService, // Inject PostsService for data operations
    private snackbarService: SnackbarService, // Inject SnackbarService for notifications
  ) {}

  ngOnInit(): void {
    // Fetch posts from the service and initialize the data source
    this.postsService.getPosts().subscribe((posts) => {
      console.log(posts); // Debug: Check if all posts are fetched
      this.posts = posts;
      this.dataSource = new MatTableDataSource<Post>(this.posts); // Set data source for the table
      // @ts-ignore
      this.dataSource.paginator = this.paginator; // Assign paginator to the data source
    });
  }

// Method to handle post deletion
  deletePost(id: string): void {
    if (confirm('Are you sure you want to delete this post?')) { // Confirm deletion action
      this.postsService.deletePost(id).subscribe({
        next: () => {
          this.snackbarService.showSnackbar('Post deleted successfully'); // Notify user of successful deletion
          // Fetch updated post list and refresh the table
          this.postsService.getPosts().subscribe({
            next: (posts) => {
              this.posts = posts;
              this.dataSource.data = this.posts; // Update data source with new post list
            },
            error: (error: any) => {
              console.error('Error fetching posts:', error); // Handle errors for fetching posts
              this.snackbarService.showSnackbar('Failed to refresh post list.');
            }
          });
        },
        error: (error: any) => {
          console.error('Error deleting post:', error); // Handle errors for deletion
          this.snackbarService.showSnackbar('Failed to delete post.');
        }
      });
    }
  }
}
