import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';
import { Router, RouterModule } from '@angular/router';

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
  profiles?: {
    full_name: string;
  };
  view_count?: number;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  blogs: Blog[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBlogs();
  }

  async loadBlogs() {
    try {
      this.loading = true;
      this.error = null;
      this.blogs = await this.supabaseService.getAllBlogs();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  navigateToBlogDetail(blogId: string | undefined) {
    if (blogId) {
      this.router.navigate(['/blog', blogId]);
    }
  }

  navigateToCategory(category: string) {
    // TODO: Kategori sayfası oluşturulduğunda güncellenecek
    console.log('Kategoriye git:', category);
  }

  navigateToAuthor(authorId: string) {
    // TODO: Yazar profil sayfası oluşturulduğunda güncellenecek
    console.log('Yazara git:', authorId);
  }
} 