import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { CategoryService, Category } from '../../../../services/category.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements OnInit {
  categories: Category[] = [];
  newCategoryName = '';
  loading = false;
  error: string | null = null;
  isAdmin = false;

  constructor(
    private supabaseService: SupabaseService,
    private categoryService: CategoryService
  ) {}

  async ngOnInit() {
    this.isAdmin = await this.supabaseService.isAdmin();
    if (this.isAdmin) {
      this.loadCategories();
    }
  }

  async loadCategories() {
    try {
      this.loading = true;
      this.error = null;
      this.categories = await this.categoryService.getCategories();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async addCategory() {
    if (!this.newCategoryName.trim()) return;

    try {
      this.loading = true;
      this.error = null;
      const userId = this.supabaseService.currentUserValue?.id;
      if (!userId) {
        throw new Error('Oturum açmanız gerekiyor');
      }
      await this.categoryService.addCategory(this.newCategoryName.trim(), userId);
      this.newCategoryName = '';
      await this.loadCategories();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async deleteCategory(id: string) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;

    try {
      this.loading = true;
      this.error = null;
      await this.categoryService.deleteCategory(id);
      await this.loadCategories();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
} 