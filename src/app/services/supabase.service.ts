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
    return data as Blog[];
  }

  async addBlog(blog: Blog, file: File): Promise<Blog> {
    const supabase = this.ensureSupabaseInitialized();
    try {
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const currentUser = this.currentUser.value;
        if (!currentUser) throw new Error('Kullanıcı oturum açmamış');
        
        const filePath = `${currentUser.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(filePath);

        blog.image_url = publicUrl;
      }

      const { data, error } = await supabase
        .from('blogs')
        .insert(blog)
        .select()
        .single();

      if (error) throw error;
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
}
