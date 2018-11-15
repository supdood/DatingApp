import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Photo } from 'src/app/_models/photo';
import { FileUploader } from 'ng2-file-upload';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css']
})
export class PhotoEditorComponent implements OnInit {
  @Input() photos: Photo[];
  @Output() mainPhotoChange = new EventEmitter<string>();

  uploader: FileUploader;
  hasBaseDropZoneOver = false;
  baseUrl = environment.apiUrl;
  mainPhoto: Photo;

  constructor(private authService: AuthService, private userService: UserService, private alertify: AlertifyService) { }

  ngOnInit() {
    this.initializeUploader();
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  setMainPhoto(photo: Photo): void {
    this.userService.setMainPhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
      this.mainPhoto = this.photos.filter(p => p.isMain === true)[0];
      this.mainPhoto.isMain = false;
      photo.isMain = true;
      this.mainPhotoChange.emit(photo.url);
    },
    error => {
      this.alertify.error(error);
    });
  }

  deletePhoto(photo: Photo): void {
    this.alertify.confirm('Are you sure you want to delete this photo?', () => {
      this.userService.deletePhoto(this.authService.decodedToken.nameid, photo.id).subscribe(() => {
        const index = this.photos.indexOf(photo);
        this.photos.splice(index, 1);
        this.alertify.success('Photo has been deleted');
      },
      error => {
        this.alertify.error(error);
      });
    });
  }

  initializeUploader() {
    this.uploader = new FileUploader({
      url: this.baseUrl + 'users/' + this.authService.decodedToken.nameid + '/photos',
      authToken: 'Bearer ' + localStorage.getItem('token'),
      isHTML5: true,
      allowedFileType: ['image'],
      removeAfterUpload: true,
      autoUpload: false,
      maxFileSize: 10 * 1024 * 1024
    });

    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    this.uploader.onSuccessItem = (item, response, status, headers) => {
      if (response) {
        const res: Photo = JSON.parse(response);
        const photo = {
          id: res.id,
          url: res.url,
          dateAdded: res.dateAdded,
          description: res.description,
          isMain: res.isMain
        };
        this.photos.push(photo);
        if (photo.isMain) {
          this.mainPhotoChange.emit(photo.url);
        }
      }
    };
  }
}
