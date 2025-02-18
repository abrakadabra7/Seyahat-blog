import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );

    // Mevcut oturumu kontrol et
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentUser.next(session?.user || null);
    });

    // Auth state değişikliklerini dinle
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.currentUser.next(session?.user || null);
    });
  }

  get currentUserValue() {
    return this.currentUser.value;
  }

  get currentUser$() {
    return this.currentUser.asObservable();
  }

  async signUp(email: string, password: string, fullName: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (user) {
        // Profil oluştur
        const { error: profileError } = await this.supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: fullName,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ]);

        if (profileError) throw profileError;
      }

      return user;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      console.error('Şifre sıfırlama hatası:', error);
      throw error;
    }
  }
} 