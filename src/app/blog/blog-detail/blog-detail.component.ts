import {Component, Input, OnInit} from '@angular/core';
import {Post} from '../../models/post';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.sass',
})
export class BlogDetailComponent {
  @Input() post!: Post;
  @Input() isMain: boolean = false;
}
