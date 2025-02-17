import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';
import { User } from '@supabase/supabase-js';

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

@Component({
  selector: 'app-blog-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-content.component.html',
  styleUrls: ['./blog-content.component.css']
})
export class BlogContentComponent implements OnChanges {
  @Input() currentUser: User | null = null;
  
  showBlogForm = false;
  isSubmitting = false;
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];
  blogs: Blog[] = [];
  error: string | null = null;
  
  newBlog: Blog = {
    user_id: '',
    title: '',
    content: '',
    category: '',
    images: []
  };

  categories = [
    'Seyahat',
    'Yemek',
    'Kültür',
    'Macera',
    'Doğa',
    'Şehir Hayatı',
    'Tarih',
    'Sanat'
  ];

  constructor(private supabaseService: SupabaseService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['currentUser'] && this.currentUser) {
      this.loadBlogs();
      this.newBlog.user_id = this.currentUser.id;
    }
  }

  async loadBlogs() {
    try {
      if (!this.currentUser) return;
      this.blogs = await this.supabaseService.getBlogs(this.currentUser.id);
    } catch (error: any) {
      this.error = error.message;
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (files && files.length > 0) {
      // Dosya boyutu kontrolü (her dosya için maksimum 5MB)
      const fileArray = Array.from(files) as File[];
      const invalidFiles = fileArray.filter((file: File) => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        this.error = 'Bazı dosyalar çok büyük. Maksimum dosya boyutu 5MB olmalıdır.';
        return;
      }

      // Dosya tipi kontrolü
      const invalidTypes = fileArray.filter((file: File) => !file.type.startsWith('image/'));
      if (invalidTypes.length > 0) {
        this.error = 'Sadece resim dosyaları yükleyebilirsiniz.';
        return;
      }

      this.selectedFiles = fileArray;
      this.imagePreviews = [];
      this.error = null;
      
      for (const file of this.selectedFiles) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(index: number) {
    this.imagePreviews.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  async addBlog() {
    if (!this.currentUser) return;

    try {
      this.isSubmitting = true;
      this.error = null;

      // Form validasyonu
      if (!this.newBlog.title.trim()) {
        this.error = 'Lütfen bir başlık girin';
        return;
      }

      if (!this.newBlog.content.trim()) {
        this.error = 'Lütfen blog içeriğini girin';
        return;
      }

      if (!this.newBlog.category) {
        this.error = 'Lütfen bir kategori seçin';
        return;
      }

      // İlk fotoğrafı kapak fotoğrafı olarak kullan
      const coverFile = this.selectedFiles[0];
      const blog = await this.supabaseService.addBlog(this.newBlog, coverFile);
      this.blogs = [blog, ...this.blogs];
      this.resetForm();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteBlog(id: string | undefined) {
    if (!id) return;
    if (!confirm('Bu blogu silmek istediğinizden emin misiniz?')) return;

    try {
      await this.supabaseService.deleteBlog(id);
      this.blogs = this.blogs.filter(blog => blog.id !== id);
    } catch (error: any) {
      this.error = error.message;
    }
  }

  editBlog(blog: Blog) {
    // Blog düzenleme özelliğini daha sonra ekleyeceğiz
    console.log('Edit blog:', blog);
  }

  resetForm() {
    this.newBlog = {
      user_id: this.currentUser!.id,
      title: '',
      content: '',
      category: '',
      images: []
    };
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.showBlogForm = false;
    this.error = null;
  }
} 