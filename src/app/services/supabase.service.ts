import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

// Interfaces
interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

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
  profiles?: {
    full_name: string;
  };
  view_count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase?: SupabaseClient;
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser: boolean;
  private readonly STORAGE_BUCKET = 'blog-images';

  constructor(private authService: AuthService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.initSupabase();
    }
  }

  // Initialization Methods
  private initSupabase(): void {
    if (!this.isBrowser) return;

    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  private ensureSupabaseInitialized(): SupabaseClient {
    if (!this.isBrowser) {
      throw new Error('Bu işlem sadece tarayıcıda kullanılabilir');
    }
    if (!this.supabase) {
      this.initSupabase();
    }
    if (!this.supabase) {
      throw new Error('Supabase başlatılamadı');
    }
    return this.supabase;
  }

  // Helper Methods
  private async getCurrentUser(): Promise<User> {
    const user = this.authService.currentUserValue;
    if (!user) throw new Error('Kullanıcı oturum açmamış');
    return user;
  }

  private async handleError(error: any, customMessage?: string): Promise<never> {
    console.error(customMessage || 'İşlem hatası:', error);
    throw new Error(error.message);
  }

  private async uploadFile(file: File, userId: string): Promise<string> {
    const supabase = this.ensureSupabaseInitialized();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(this.STORAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    return filePath;
  }

  private getPublicUrl(path: string): string {
    const supabase = this.ensureSupabaseInitialized();
    const { data: { publicUrl } } = supabase.storage
      .from(this.STORAGE_BUCKET)
      .getPublicUrl(path);
    return publicUrl;
  }

  private enrichBlogWithUrls(blog: Blog): Blog {
    if (blog.image_url) {
      blog.image_url = this.getPublicUrl(blog.image_url);
    }

    if (blog.images?.length > 0) {
      blog.images = blog.images.map(path => this.getPublicUrl(path));
    }

    return blog;
  }

  private async getProfileForBlog(userId: string): Promise<{ full_name: string }> {
    const supabase = this.ensureSupabaseInitialized();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Profil getirme hatası:', error);
      return { full_name: 'Anonim' };
    }

    return profile;
  }

  // Blog CRUD Operations
  async getBlogs(userId: string): Promise<Blog[]> {
    try {
      const supabase = this.ensureSupabaseInitialized();
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(blog => this.enrichBlogWithUrls(blog));
    } catch (error) {
      return this.handleError(error, 'Blogları getirme hatası');
    }
  }

  async getAllBlogs(): Promise<Blog[]> {
    try {
      const supabase = this.ensureSupabaseInitialized();
      const { data: blogs, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!blogs) return [];

      return await Promise.all(
        blogs.map(async (blog) => {
          const profile = await this.getProfileForBlog(blog.user_id);
          const enrichedBlog = this.enrichBlogWithUrls(blog);
          return { ...enrichedBlog, profiles: profile };
        })
      );
    } catch (error) {
      return this.handleError(error, 'Tüm blogları getirme hatası');
    }
  }

  async getBlogById(id: string): Promise<Blog> {
    try {
      const supabase = this.ensureSupabaseInitialized();
      const { data: blog, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!blog) throw new Error('Blog bulunamadı');

      const profile = await this.getProfileForBlog(blog.user_id);
      const enrichedBlog = this.enrichBlogWithUrls(blog);
      return { ...enrichedBlog, profiles: profile };
    } catch (error) {
      return this.handleError(error, 'Blog detayı getirme hatası');
    }
  }

  async addBlog(blog: Blog, coverFile: File, additionalFiles?: File[]): Promise<Blog> {
    try {
      const currentUser = await this.getCurrentUser();
      const supabase = this.ensureSupabaseInitialized();

      // Fotoğrafları yükle
      if (coverFile) {
        blog.image_url = await this.uploadFile(coverFile, currentUser.id);
      }

      blog.images = [];
      if (additionalFiles?.length) {
        blog.images = await Promise.all(
          additionalFiles.map(file => this.uploadFile(file, currentUser.id))
        );
      }

      // Blog'u kaydet
      const { data, error } = await supabase
        .from('blogs')
        .insert({ ...blog, user_id: currentUser.id })
        .select()
        .single();

      if (error) throw error;
      return this.enrichBlogWithUrls(data);
    } catch (error) {
      return this.handleError(error, 'Blog ekleme hatası');
    }
  }

  async deleteBlog(id: string): Promise<void> {
    try {
      const supabase = this.ensureSupabaseInitialized();
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      return this.handleError(error, 'Blog silme hatası');
    }
  }

  // Blog Reading Operations
  async getReadBlogs(): Promise<Blog[]> {
    try {
      const supabase = this.ensureSupabaseInitialized();
      const user = await this.getCurrentUser();

      const { data: readBlogs, error } = await supabase
        .from('read_blogs')
        .select('blog_id, created_at, blogs (*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!readBlogs) return [];

      return readBlogs.map((item: any) => {
        const blog = item.blogs;
        blog.read_at = item.created_at;
        return this.enrichBlogWithUrls(blog);
      });
    } catch (error) {
      return this.handleError(error, 'Okunan blogları getirme hatası');
    }
  }

  async markBlogAsRead(blogId: string | undefined): Promise<void> {
    try {
      if (!blogId) throw new Error('Blog ID geçersiz');
      
      const supabase = this.ensureSupabaseInitialized();
      const user = await this.getCurrentUser();

      const { error } = await supabase
        .from('read_blogs')
        .upsert({
          user_id: user.id,
          blog_id: blogId
        }, {
          onConflict: 'user_id,blog_id'
        });

      if (error) throw error;
    } catch (error) {
      return this.handleError(error, 'Blog okundu işaretleme hatası');
    }
  }

  // Blog Statistics
  async incrementBlogViewCount(blogId: string): Promise<number> {
    try {
      const supabase = this.ensureSupabaseInitialized();
      const { data, error } = await supabase.rpc('increment_blog_view_count', {
        blog_id: blogId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      return this.handleError(error, 'Blog görüntülenme sayısı güncelleme hatası');
    }
  }

  // User Operations
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      const { data: profile } = await this.supabase!
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      return profile?.is_admin || false;
    } catch (error) {
      console.error('Admin kontrolü hatası:', error);
      return false;
    }
  }
}
