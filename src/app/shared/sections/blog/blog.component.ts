import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  isVideoPlaying: boolean = false;
  videoUrl: SafeResourceUrl;
  private readonly youtubeVideoId = 'YOUR_VIDEO_ID'; // YouTube video ID'sini buraya ekleyin

  constructor(private sanitizer: DomSanitizer) {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${this.youtubeVideoId}?autoplay=1`
    );
  }

  ngOnInit(): void {}

  playVideo(): void {
    this.isVideoPlaying = true;
  }

  closeVideo(): void {
    this.isVideoPlaying = false;
  }
} 