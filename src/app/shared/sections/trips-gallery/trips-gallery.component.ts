import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trips-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trips-gallery.component.html',
  styleUrls: ['./trips-gallery.component.css']
})
export class TripsGalleryComponent {
  trips = [
    {
      id: 1,
      title: 'Ultricies Tristique Nulla Aliquet',
      description: 'Egestas quis ipsum suspendisse ultrices gravida. Sed adipiscing diam donec adipiscing tristique risus nec feugiat in. Arcu risus quis varius quam quisque id diam. Aliquet enim tortor at auctor urna nunc id. Sed euismod nisi porta lorem mollis aliquam ut.',
      image: '/assets/images/Trips1.jpg',
      rating: 4,
      featured: true
    },
    {
      id: 2,
      title: 'Mountain Adventures',
      description: 'Discover the beauty of mountain landscapes',
      image: '/assets/images/Trips2.jpg',
      rating: 3,
      featured: false
    },
    {
      id: 3,
      title: 'Forest Exploration',
      description: 'Experience the tranquility of ancient forests',
      image: '/assets/images/Trips3.jpg',
      rating: 5,
      featured: false
    },
    {
      id: 4,
      title: 'Desert Safari',
      description: 'Adventure through golden sand dunes',
      image: '/assets/images/Trips4.jpg',
      rating: 4,
      featured: false
    },
    {
      id: 5,
      title: 'Coastal Journey',
      description: 'Explore beautiful coastal regions',
      image: '/assets/images/Trips5.jpg',
      rating: 4,
      featured: false
    }
  ];
} 