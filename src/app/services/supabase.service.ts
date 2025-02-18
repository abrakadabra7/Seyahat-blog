import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { isPlatformBrowser } from '@angular/common';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface ReadBlogResponse {
  blog_id: string;
  read_at: string;
  blogs: Blog;
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
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase?: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.initSupabase();
    }
  }

  private initSupabase() {
    if (!this.isBrowser) return;

    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Mevcut oturumu kontrol et
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.next(session?.user ?? null);
    });

    // Auth state değişikliklerini dinle
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.next(session?.user ?? null);
    });
  }

  get currentUserValue() {
    return this.currentUser.value;
  }

  get currentUser$() {
    return this.currentUser.asObservable();
  }

  private ensureSupabaseInitialized() {
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

  // Blog işlemleri için yeni metodlar
  async getBlogs(userId: string) {
    const supabase = this.ensureSupabaseInitialized();
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Her blog için fotoğrafların public URL'lerini al
    const blogsWithUrls = await Promise.all(data.map(async (blog) => {
      // Kapak fotoğrafı için public URL al
      if (blog.image_url) {
        const { data: { publicUrl: coverImageUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(blog.image_url);
        blog.image_url = coverImageUrl;
      }

      // Ek fotoğraflar için public URL'leri al
      if (blog.images && blog.images.length > 0) {
        blog.images = blog.images.map((imagePath: string) => {
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(imagePath);
          return publicUrl;
        });
      }

      return blog;
    }));

    return blogsWithUrls as Blog[];
  }

  async getAllBlogs() {
    const supabase = this.ensureSupabaseInitialized();
    
    try {
      // Önce tüm blogları getir
      const { data: blogs, error: blogsError } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (blogsError) throw blogsError;
      if (!blogs) return [];

      // Her blog için profil bilgisini ve fotoğraf URL'lerini al
      const blogsWithProfilesAndUrls = await Promise.all(
        blogs.map(async (blog) => {
          // Profil bilgisini al
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', blog.user_id)
            .single();

          if (profileError) {
            console.error('Profil getirme hatası:', profileError);
            return { ...blog, profiles: { full_name: 'Anonim' } };
          }

          // Kapak fotoğrafı için public URL al
          if (blog.image_url) {
            const { data: { publicUrl: coverImageUrl } } = supabase.storage
              .from('blog-images')
              .getPublicUrl(blog.image_url);
            blog.image_url = coverImageUrl;
          }

          // Ek fotoğraflar için public URL'leri al
          if (blog.images && blog.images.length > 0) {
            blog.images = blog.images.map((imagePath: string) => {
              const { data: { publicUrl } } = supabase.storage
                .from('blog-images')
                .getPublicUrl(imagePath);
              return publicUrl;
            });
          }

          return { ...blog, profiles: profile };
        })
      );

      return blogsWithProfilesAndUrls;
    } catch (error) {
      throw error;
    }
  }

  async addBlog(blog: Blog, coverFile: File, additionalFiles?: File[]): Promise<Blog> {
    const supabase = this.ensureSupabaseInitialized();
    try {
      const currentUser = this.currentUser.value;
      if (!currentUser) throw new Error('Kullanıcı oturum açmamış');

      // Kapak fotoğrafını yükle
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, coverFile);

        if (uploadError) throw uploadError;
        blog.image_url = filePath;
      }

      // Ek fotoğrafları yükle
      blog.images = [];
      if (additionalFiles && additionalFiles.length > 0) {
        const uploadPromises = additionalFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${currentUser.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, file);

          if (uploadError) throw uploadError;
          return filePath;
        });

        blog.images = await Promise.all(uploadPromises);
      }

      // Blog'u veritabanına kaydet
      const { data, error } = await supabase
        .from('blogs')
        .insert(blog)
        .select()
        .single();

      if (error) throw error;

      // Public URL'leri al
      if (data.image_url) {
        const { data: { publicUrl: coverImageUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(data.image_url);
        data.image_url = coverImageUrl;
      }

      if (data.images && data.images.length > 0) {
        data.images = data.images.map((imagePath: string) => {
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(imagePath);
          return publicUrl;
        });
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async deleteBlog(id: string) {
    const supabase = this.ensureSupabaseInitialized();
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async signUp(email: string, password: string, fullName: string) {
    const supabase = this.ensureSupabaseInitialized();

    try {
      // Auth kaydı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (authError) throw authError;

      if (authData.user) {
        // Profil oluştur
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: fullName
          });

        if (profileError) {
          console.error('Profil oluşturma hatası:', profileError);
          throw profileError;
        }
      }

      return authData;
    } catch (error) {
      console.error('SignUp hatası:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    const supabase = this.ensureSupabaseInitialized();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const supabase = this.ensureSupabaseInitialized();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async resetPassword(email: string) {
    const supabase = this.ensureSupabaseInitialized();

    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  }

  async getProfile(userId: string) {
    const supabase = this.ensureSupabaseInitialized();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data as Profile;
  }

  async updateProfile(profile: Partial<Profile>) {
    const supabase = this.ensureSupabaseInitialized();

    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', this.currentUserValue?.id);

    if (error) throw error;
    return data;
  }

  async getBlogById(id: string) {
    const supabase = this.ensureSupabaseInitialized();
    
    try {
      // Blog bilgilerini getir
      const { data: blog, error: blogError } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', id)
        .single();

      if (blogError) throw blogError;
      if (!blog) throw new Error('Blog bulunamadı');

      // Yazar bilgilerini getir
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', blog.user_id)
        .single();

      if (profileError) {
        console.error('Profil getirme hatası:', profileError);
        return { ...blog, profiles: { full_name: 'Anonim' } };
      }

      // Kapak fotoğrafı için public URL al
      if (blog.image_url) {
        const { data: { publicUrl: coverImageUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(blog.image_url);
        blog.image_url = coverImageUrl;
      }

      // Ek fotoğraflar için public URL'leri al
      if (blog.images && blog.images.length > 0) {
        blog.images = blog.images.map((imagePath: string) => {
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(imagePath);
          return publicUrl;
        });
      }

      return { ...blog, profiles: profile };
    } catch (error) {
      throw error;
    }
  }

  async getReadBlogs(): Promise<Blog[]> {
    try {
      const supabase = await this.ensureSupabaseInitialized();
      const user = await this.currentUserValue;
      
      if (!user) {
        throw new Error('Kullanıcı girişi yapılmamış');
      }

      const { data: readBlogs, error } = await supabase
        .from('read_blogs')
        .select(`
          blog_id,
          created_at,
          blogs (
            id,
            user_id,
            title,
            content,
            image_url,
            category,
            created_at,
            updated_at,
            images
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (!readBlogs) {
        return [];
      }

      const blogsWithUrls = await Promise.all(readBlogs.map(async (item: any) => {
        const blog = item.blogs;
        blog.read_at = item.created_at;

        // Kapak fotoğrafı için public URL al
        if (blog.image_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(blog.image_url);
          blog.image_url = publicUrl;
        }

        // Ek fotoğraflar için public URL'leri al
        if (blog.images && blog.images.length > 0) {
          blog.images = blog.images.map((imagePath: string) => {
            const { data: { publicUrl } } = supabase.storage
              .from('blog-images')
              .getPublicUrl(imagePath);
            return publicUrl;
          });
        }

        return blog;
      }));

      return blogsWithUrls;
    } catch (error) {
      console.error('Okunan blogları getirme hatası:', error);
      throw error;
    }
  }

  async markBlogAsRead(blogId: string | undefined) {
    try {
      if (!blogId) {
        throw new Error('Blog ID geçersiz');
      }

      const supabase = await this.ensureSupabaseInitialized();
      const user = await this.currentUserValue;
      
      if (!user) {
        throw new Error('Kullanıcı girişi yapılmamış');
      }

      const { error } = await supabase
        .from('read_blogs')
        .upsert({
          user_id: user.id,
          blog_id: blogId
        }, {
          onConflict: 'user_id,blog_id'
        });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Blog okundu işaretleme hatası:', error);
      throw error;
    }
  }
}
