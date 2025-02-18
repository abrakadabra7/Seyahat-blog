import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  isVisible = false;
  activeTab: 'login' | 'register' = 'login';
  loading = false;
  error: string | null = null;

  loginForm = {
    email: '',
    password: ''
  };

  registerForm = {
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService) {}

  openModal() {
    this.isVisible = true;
    this.resetForms();
  }

  closeModal() {
    this.isVisible = false;
    this.resetForms();
  }

  async handleLogin() {
    if (this.loading) return;

    try {
      this.loading = true;
      this.error = null;

      await this.authService.signIn(
        this.loginForm.email,
        this.loginForm.password
      );

      this.closeModal();
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  async handleRegister() {
    if (this.loading) return;

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.error = 'Şifreler eşleşmiyor';
      return;
    }

    try {
      this.loading = true;
      this.error = null;

      await this.authService.signUp(
        this.registerForm.email,
        this.registerForm.password,
        this.registerForm.fullName
      );

      this.error = 'Kayıt başarılı! Lütfen email adresinizi doğrulayın.';
      setTimeout(() => {
        this.activeTab = 'login';
        this.error = null;
      }, 3000);
    } catch (error: any) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
  }

  private resetForms() {
    this.loginForm = {
      email: '',
      password: ''
    };

    this.registerForm = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    this.error = null;
  }
}
