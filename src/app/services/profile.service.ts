import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async getProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profil getirme hatası:', error);
      throw error;
    }
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(profile)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  }

  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.supabase.auth.getUser();
      if (!user.data.user) return false;
      
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.data.user.id)
        .single();
      
      return profile?.is_admin || false;
    } catch (error) {
      console.error('Admin kontrolü hatası:', error);
      return false;
    }
  }
} 