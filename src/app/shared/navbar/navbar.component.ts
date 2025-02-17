import { Component, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { SupabaseService } from '../../services/supabase.service';
import { User } from '@supabase/supabase-js';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthModalComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  isScrolled = false;
  @ViewChild('authModal') authModal!: AuthModalComponent;
  currentUser: User | null = null;

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Kullanıcı durumunu takip et
    this.supabaseService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  openAuthModal() {
    this.authModal.openModal();
  }

  async handleLogout() {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error);
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }
}
