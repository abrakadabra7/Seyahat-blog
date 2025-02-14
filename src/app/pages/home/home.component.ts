import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DestinationsComponent } from '../../shared/sections/destinations/destinations.component';
import { BlogComponent } from '../../shared/sections/blog/blog.component';
import { TripsGalleryComponent } from '../../shared/sections/trips-gallery/trips-gallery.component';
import { SeasonalComponent } from '../../shared/sections/seasonal/seasonal.component';
import { InfoColumnsComponent } from '../../shared/sections/info-columns/info-columns.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    DestinationsComponent, 
    BlogComponent, 
    TripsGalleryComponent,
    SeasonalComponent,
    InfoColumnsComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isVideoPlaying = false;
  videoUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.youtube.com/embed/vZdYo_1Pwz8?autoplay=1&si=-cXYOTIsTKcwNIxf'
    );
  }

  playVideo() {
    this.isVideoPlaying = true;
  }
}
