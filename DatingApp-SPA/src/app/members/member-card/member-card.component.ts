import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/_models/user';
import { AuthService } from 'src/app/_services/auth.service';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';

@Component({
  selector: 'app-member-card',
  templateUrl: './member-card.component.html',
  styleUrls: ['./member-card.component.css']
})
export class MemberCardComponent implements OnInit {
  @Input() user: User;

  constructor(private authService: AuthService, private userService: UserService, private alertify: AlertifyService) { }

  ngOnInit() {
    if (!this.user.photoUrl) {
      this.user.photoUrl = '../../../assets/user.png';
    }
  }

  sendLike(id: number) {
    this.userService.sendLike(this.authService.decodedToken.nameid, id).subscribe(data => {
      this.alertify.success('You have liked: ' + this.user.knownAs);
      this.user.liked = true;
    }, error => {
      this.alertify.error(error);
    });
  }

  removeLike(id: number) {
    this.userService.removeLike(this.authService.decodedToken.nameid, id).subscribe(data => {
      this.alertify.success('You have unliked: ' + this.user.knownAs);
      this.user.liked = false;
    }, error => {
      this.alertify.error(error);
    });
  }
}
