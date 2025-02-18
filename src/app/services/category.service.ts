import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface Category {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Kategorileri getirme hatası:', error);
      throw error;
    }
  }

  async addCategory(name: string, userId: string): Promise<Category> {
    try {
      if (!userId) throw new Error('Oturum açmanız gerekiyor');
      
      const { data, error } = await this.supabase
        .from('categories')
        .insert([{ name, created_by: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Kategori silme hatası:', error);
      throw error;
    }
  }
} 