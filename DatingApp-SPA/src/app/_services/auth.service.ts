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
  user = new BehaviorSubject<User>(new User());
  photoUrl = new BehaviorSubject<string>(this.defaultPhotoUrl);
  currentUser = this.user.asObservable();
  currentUserPhotoUrl = this.photoUrl.asObservable();

  constructor(private http: HttpClient, private userService: UserService) { }

  login(model: any) {
    return this.http.post(this.baseUrl + 'login', model).pipe(
      map((response: any) => {
        const user = response;
        if (user) {
          localStorage.setItem('token', user.token);
          this.decodedToken = this.jwtHelper.decodeToken(user.token);
          this.setCurrentUser();
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

  roleMatch(allowedRoles): boolean {
    let isMatch = false;
    const userRoles = this.decodedToken.role as Array<string>;
    allowedRoles.forEach(element => {
      if (userRoles.includes(element)) {
        isMatch = true;
        return;
      }
    });
    return isMatch;
  }

  setCurrentUser() {
    if (this.loggedIn()) {
      this.userService.getUser(this.decodedToken.nameid).subscribe(user => {
        if (user.photoUrl) {
          this.user.next(user);
          this.photoUrl.next(user.photoUrl);
        }
      });
    }
  }
}
