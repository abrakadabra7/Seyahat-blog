import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../../services/supabase.service';
import { AuthService } from '../../../services/auth.service';

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
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent implements OnInit {
  blog: Blog | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const blogId = this.route.snapshot.paramMap.get('id');
    if (blogId) {
      this.loadBlog(blogId);
    }
  }

  private async loadBlog(id: string) {
    try {
      this.loading = true;
      this.error = null;
      this.blog = await this.supabaseService.getBlogById(id);

      // Blog yüklendiğinde okundu olarak işaretle ve görüntülenme sayısını artır
      if (this.blog && this.blog.id && this.authService.currentUserValue) {
        await Promise.all([
          this.supabaseService.markBlogAsRead(this.blog.id),
          this.supabaseService.incrementBlogViewCount(this.blog.id)
        ]);
      }
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  navigateToCategory(category: string | undefined) {
    if (category) {
      // TODO: Kategori sayfası oluşturulduğunda güncellenecek
      console.log('Kategoriye git:', category);
    }
  }

  navigateToAuthor(authorId: string | undefined) {
    if (authorId) {
      // TODO: Yazar profil sayfası oluşturulduğunda güncellenecek
      console.log('Yazara git:', authorId);
    }
  }
} 