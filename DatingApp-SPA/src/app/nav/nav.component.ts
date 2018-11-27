import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';
import { AlertifyService } from '../_services/alertify.service';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { User } from '../_models/user';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  model: any = {};
  currentUser: User;
  photoUrl: string;

  constructor(public authService: AuthService, private userService: UserService,
     private alertify: AlertifyService, private router: Router) { }

  ngOnInit() {
    this.authService.setCurrentUser();
    this.authService.currentUserPhotoUrl.subscribe(photoUrl => {
      this.photoUrl = photoUrl;
    });
  }

  login() {
    this.authService.login(this.model).subscribe(next => {
      this.alertify.success('Logged in successfully');
      this.authService.currentUserPhotoUrl.subscribe(photoUrl => {
        this.photoUrl = photoUrl;
      });
    }, error => {
      this.alertify.error(error);
    }, () => {
      this.router.navigate(['members']);
    });
  }

  loggedIn() {
    return this.authService.loggedIn();
  }

  logout() {
    this.authService.logout();
    this.alertify.message('logged out');
    this.router.navigate(['home']);
  }
}
