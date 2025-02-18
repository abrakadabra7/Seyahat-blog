import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../../services/supabase.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

interface Blog {
  id?: string;
  user_id: string;
  title: string;
  content: string;
  image_url?: string;
  category: string;
  created_at?: string;
  updated_at?: string;
  images: string[];
  read_at?: string;
}

@Component({
  selector: 'app-read-blogs',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './read-blogs.component.html',
  styleUrls: ['./read-blogs.component.css']
})
export class ReadBlogsComponent implements OnInit {
  readBlogs: Blog[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.currentUserValue) {
      this.loadReadBlogs();
    }
  }

  async loadReadBlogs() {
    try {
      this.loading = true;
      this.error = null;
      this.readBlogs = await this.supabaseService.getReadBlogs();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  readAgain(blogId: string | undefined) {
    if (blogId) {
      this.router.navigate(['/blog', blogId]);
    }
  }
} 