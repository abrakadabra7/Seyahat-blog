import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  aboutLinks = [
    { title: 'About Organization', path: '/about' },
    { title: 'Our Journeys', path: '/journeys' },
    { title: 'Our Partners', path: '/partners' }
  ];

  quickLinks = [
    { title: 'Introduction', path: '/intro' },
    { title: 'Organisation Team', path: '/team' },
    { title: 'Press Enquiries', path: '/press' }
  ];

  importantLinks = [
    { title: 'Privacy Policy', path: '/privacy' },
    { title: 'Cookies Policy', path: '/cookies' },
    { title: 'Terms & Conditions', path: '/terms' }
  ];

  contactInfo = {
    description: 'Nunc lobortis mattis aliquam faucibus purus in massa arcu odio ut sem nulla pharetra diam amet.',
    address: 'Street Name, NY 38954',
    phone: '578-393-4937',
    mobile: '578-393-4937'
  };

  socialLinks = [
    { icon: 'facebook', url: 'https://facebook.com', name: 'Facebook' },
    { icon: 'alternate_email', url: 'https://twitter.com', name: 'Twitter' },
    { icon: 'photo_camera', url: 'https://instagram.com', name: 'Instagram' },
    { icon: 'play_circle', url: 'https://youtube.com', name: 'YouTube' },
    { icon: 'videocam', url: 'https://vimeo.com', name: 'Vimeo' },
    { icon: 'push_pin', url: 'https://pinterest.com', name: 'Pinterest' },
    { icon: 'article', url: 'https://medium.com', name: 'Medium' }
  ];
} 