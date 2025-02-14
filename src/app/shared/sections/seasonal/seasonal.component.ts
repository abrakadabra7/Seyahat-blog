import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seasonal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seasonal.component.html',
  styleUrls: ['./seasonal.component.css']
})
export class SeasonalComponent {
  seasons = [
    {
      id: 1,
      name: 'Winter',
      title: 'Snow Adventures',
      description: 'Discover winter wonderlands and snowy escapes. From skiing in the Alps to winter festivals in Scandinavia.',
      activities: ['Skiing', 'Snowboarding', 'Ice Skating', 'Northern Lights Tours'],
      image: '/assets/images/winter.jpg',
      temperature: '-5°C to 5°C',
      recommendedGear: ['Thermal Wear', 'Snow Boots', 'Winter Jacket', 'Gloves'],
      featured: true
    },
    {
      id: 2,
      name: 'Spring',
      title: 'Bloom & Adventure',
      description: 'Experience nature\'s revival with cherry blossoms in Japan and tulip fields in Netherlands.',
      activities: ['Cherry Blossom Viewing', 'Hiking', 'Garden Tours', 'Cultural Festivals'],
      image: '/assets/images/spring.jpg',
      temperature: '10°C to 20°C',
      recommendedGear: ['Light Jacket', 'Comfortable Shoes', 'Rain Gear', 'Camera'],
      featured: false
    },
    {
      id: 3,
      name: 'Summer',
      title: 'Coastal Escapes',
      description: 'Dive into crystal clear waters and explore Mediterranean coastlines.',
      activities: ['Beach Hopping', 'Scuba Diving', 'Island Tours', 'Water Sports'],
      image: '/assets/images/summer.jpg',
      temperature: '25°C to 35°C',
      recommendedGear: ['Swimwear', 'Sun Protection', 'Beach Essentials', 'Light Clothing'],
      featured: false
    },
    {
      id: 4,
      name: 'Autumn',
      title: 'Fall Colors Tour',
      description: 'Witness the spectacular fall foliage and harvest festivals around the world.',
      activities: ['Fall Foliage Tours', 'Wine Tasting', 'Hiking', 'Photography Tours'],
      image: '/assets/images/autumn.jpg',
      temperature: '10°C to 20°C',
      recommendedGear: ['Layered Clothing', 'Hiking Boots', 'Camera', 'Light Jacket'],
      featured: false
    }
  ];

  currentSeason = this.seasons[0]; // Varsayılan olarak ilk sezonu göster

  selectSeason(season: any) {
    this.currentSeason = season;
  }
} 