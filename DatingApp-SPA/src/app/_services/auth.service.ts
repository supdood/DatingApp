import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  baseUrl = environment.apiUrl + 'auth/';
  jwtHelper = new JwtHelperService();
  decodedToken: any;

  defaultPhotoUrl = '../../assets/user.png';
  photoUrl = new BehaviorSubject<string>(this.defaultPhotoUrl);
  currentUserPhotoUrl = this.photoUrl.asObservable();

  constructor(private http: HttpClient, private userService: UserService) { }

  login(model: any) {
    return this.http.post(this.baseUrl + 'login', model).pipe(
      map((response: any) => {
        const user = response;
        if (user) {
          localStorage.setItem('token', user.token);
          this.decodedToken = this.jwtHelper.decodeToken(user.token);
          this.setCurrentUserPhoto();
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.photoUrl.next(this.defaultPhotoUrl);
  }

  register(user: User) {
    return this.http.post(this.baseUrl + 'register', user);
  }

  loggedIn() {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  setCurrentUserPhoto() {
    if (this.loggedIn()) {
      this.userService.getUser(this.decodedToken.nameid).subscribe(user => {
        if (user.photoUrl) {
          this.photoUrl.next(user.photoUrl);
        }
      });
    }
  }
}
