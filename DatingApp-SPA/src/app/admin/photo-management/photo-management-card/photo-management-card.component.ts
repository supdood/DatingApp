import { Component, OnInit, Input } from '@angular/core';
import { Photo } from 'src/app/_models/photo';

@Component({
  selector: 'app-photo-management-card',
  templateUrl: './photo-management-card.component.html',
  styleUrls: ['./photo-management-card.component.css']
})
export class PhotoManagementCardComponent implements OnInit {
  @Input() photo: Photo;
  constructor() { }

  ngOnInit() {
  }

  approvePhoto() {

  }

  denyPhoto() {

  }
}
