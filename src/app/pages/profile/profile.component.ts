import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profile: Profile | null = null;
  loading = false;
  error: string | null = null;

  constructor(private supabaseService: SupabaseService) {
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadProfile();
      }
    });
  }

  ngOnInit() {
    if (this.currentUser) {
      this.loadProfile();
    }
  }

  async loadProfile() {
    try {
      this.loading = true;
      this.error = null;
      this.profile = await this.supabaseService.getProfile(this.currentUser!.id);
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async updateProfile(fullName: string) {
    try {
      this.loading = true;
      this.error = null;
      
      if (!this.profile) return;

      await this.supabaseService.updateProfile({
        id: this.profile.id,
        full_name: fullName
      });

      await this.loadProfile();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }
} 