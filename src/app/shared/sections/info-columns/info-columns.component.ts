import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-columns',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-columns.component.html',
  styleUrls: ['./info-columns.component.css']
})
export class InfoColumnsComponent {
  columns = [
    {
      title: 'Nullam Eget Felis Ogetnunc',
      paragraphs: [
        'Malesuada fames ac turpis egestas. Amet luctus venenatis lectus magna fringilla urna porttitor. Dictum fusce ut placerat orci nulla pellentesque.',
        'Cras adipiscing enim eu turpis egestas pretium. Aenean sed adipiscing diam donec adipiscing tristique.'
      ]
    },
    {
      title: 'Justo Laoreet Sitamet Cursus',
      paragraphs: [
        'Vitae aliquet nec ullamcorper sit amet risus nullam eget felis. Leo urna molestie at elementum pellentesque habitant tristique.',
        'Tempor commodo ullamcorper a lacus. Nunc scelerisque viverra mauris in. Nisl nunc mi ipsum faucibus vitae.'
      ]
    }
  ];
} 